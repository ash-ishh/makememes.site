import importlib.util
import signal
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Dict

import videodb


class TemplateExecutionError(Exception):
    """User-friendly error for template execution failures"""
    def __init__(self, message: str, code: str = "execution_error", details: str = None):
        self.message = message
        self.code = code
        self.details = details
        super().__init__(message)


class TimeoutError(TemplateExecutionError):
    """Raised when template execution exceeds timeout"""
    def __init__(self):
        super().__init__(
            "Template execution timed out. Try with shorter clips or simpler parameters.",
            code="timeout_error"
        )


@contextmanager
def timeout(seconds: int):
    """Context manager for execution timeout"""
    def timeout_handler(signum, frame):
        raise TimeoutError()

    original_handler = signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, original_handler)


def load_template_module(path: Path):
    """Dynamically load a template Python module"""
    spec = importlib.util.spec_from_file_location(path.stem, path)
    module = importlib.util.module_from_spec(spec)
    if spec and spec.loader:
        spec.loader.exec_module(module)
    return module


def create_connection(api_key: str):
    """Create a VideoDB connection with error handling"""
    try:
        conn = videodb.connect(api_key=api_key)
        return conn
    except Exception as e:
        error_msg = str(e).lower()
        if "api key" in error_msg or "unauthorized" in error_msg or "401" in error_msg:
            raise TemplateExecutionError(
                "Invalid or expired VideoDB API key. Please check your key and try again.",
                code="invalid_api_key"
            )
        raise TemplateExecutionError(
            "Failed to connect to VideoDB. Please check your API key and network connection.",
            code="connection_error",
            details=str(e)
        )


def execute_render_function(render_func, conn, params):
    """Execute the render function with error handling and mapping"""
    try:
        with timeout(30):
            result = render_func(conn, params)
    except TimeoutError:
        raise
    except Exception as e:
        error_msg = str(e).lower()

        # Map common VideoDB errors to user-friendly messages
        if "not found" in error_msg or "404" in error_msg:
            raise TemplateExecutionError(
                "One or more video/image/audio assets were not found. Please check your asset IDs.",
                code="asset_not_found",
                details=str(e)
            )
        elif "duration" in error_msg and "exceeds" in error_msg:
            raise TemplateExecutionError(
                "Requested clip duration exceeds the source video length. Please use a shorter duration.",
                code="duration_error",
                details=str(e)
            )
        elif "index_spoken_words" in error_msg or "caption" in error_msg:
            raise TemplateExecutionError(
                "Auto-captions require the video to be indexed first. Please ensure your video has been indexed with index_spoken_words().",
                code="caption_index_missing",
                details=str(e)
            )
        elif "permission" in error_msg or "403" in error_msg:
            raise TemplateExecutionError(
                "Permission denied. You don't have access to one or more assets.",
                code="permission_denied",
                details=str(e)
            )
        else:
            raise TemplateExecutionError(
                "Template execution failed. Please check your parameters and try again.",
                code="execution_error",
                details=str(e)
            )

    return result


def validate_result(result):
    """Validate and format the execution result"""
    if not isinstance(result, dict):
        raise TemplateExecutionError(
            "Template returned invalid data format.",
            code="invalid_result"
        )

    stream_url = result.get("stream_url")
    if not stream_url:
        raise TemplateExecutionError(
            "Template did not generate a stream URL.",
            code="no_stream_url"
        )

    # Generate player URL (VideoDB pattern)
    player_url = result.get("player_url")
    if not player_url and stream_url:
        # VideoDB typically provides stream URLs that can be used directly
        player_url = stream_url

    return {
        "stream_url": stream_url,
        "player_url": player_url,
        "metadata": result.get("metadata", {}),
    }


def run_template(code_path: Path, template_id: str, api_key: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a template with timeout and error handling"""

    # Load template module
    try:
        module = load_template_module(code_path)
    except Exception as e:
        raise TemplateExecutionError(
            "Failed to load template code.",
            code="template_load_error",
            details=str(e)
        )

    if not hasattr(module, "render"):
        raise TemplateExecutionError(
            "Template is missing the required render() function.",
            code="invalid_template"
        )

    # Create VideoDB connection
    conn = create_connection(api_key)

    # Execute template
    result = execute_render_function(module.render, conn, params)

    # Validate and format result
    return validate_result(result)


def run_custom_code(code: str, api_key: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute custom user-provided code with timeout and error handling"""

    # Compile the code
    try:
        compiled_code = compile(code, '<user-code>', 'exec')
    except SyntaxError as e:
        raise TemplateExecutionError(
            f"Syntax error in your code at line {e.lineno}: {e.msg}",
            code="syntax_error",
            details=str(e)
        )
    except Exception as e:
        raise TemplateExecutionError(
            "Failed to compile your code. Please check for syntax errors.",
            code="compilation_error",
            details=str(e)
        )

    # Create a namespace for execution
    namespace = {
        '__builtins__': __builtins__,
        'videodb': videodb,
    }

    # Execute the code to define functions
    try:
        exec(compiled_code, namespace)
    except Exception as e:
        raise TemplateExecutionError(
            "Error executing your code. Please check for errors.",
            code="execution_error",
            details=str(e)
        )

    # Check for render function
    if 'render' not in namespace or not callable(namespace['render']):
        raise TemplateExecutionError(
            "Your code must define a render(conn, params) function.",
            code="missing_render_function"
        )

    # Create VideoDB connection
    conn = create_connection(api_key)

    # Execute the render function
    result = execute_render_function(namespace['render'], conn, params)

    # Validate and format result
    return validate_result(result)
