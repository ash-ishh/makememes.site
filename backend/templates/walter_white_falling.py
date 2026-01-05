from videodb.editor import (
    Timeline, Track, Clip, VideoAsset, TextAsset,
    Font, Border, Shadow,
    Alignment, HorizontalAlignment, VerticalAlignment,
    Fit, Offset
)


def render(conn, params):
    """
    Creates a meme video with text overlay on a square format.
    Overlays custom text on top of a video clip in a 1:1 aspect ratio
    with letterboxing to preserve the original video aspect ratio.
    """
    video_id = params["video_id"]
    text = params["text"]
    duration = params.get("duration", 9.5)
    font_size = params.get("font_size", 44)
    font_color = params.get("font_color", "#FFFFFF")
    border_color = params.get("border_color", "#000000")
    border_width = params.get("border_width", 1.5)
    video_start = params.get("video_start", 0)

    # Create timeline with square format (1080x1080)
    timeline = Timeline(conn)
    timeline.background = "#000000"
    timeline.resolution = "1080x1080"

    # Create video asset
    video_asset = VideoAsset(id=video_id, start=video_start, volume=1.0)

    # Create video clip with contain fit (preserves aspect ratio, adds letterboxing)
    video_clip = Clip(
        asset=video_asset,
        duration=duration,
        fit=Fit.contain
    )

    # Create text asset with the meme text
    text_asset = TextAsset(
        text=text,
        font=Font(
            family="Arial",
            size=font_size,
            color=font_color,
            opacity=1.0
        ),
        border=Border(
            color=border_color,
            width=border_width
        ),
        shadow=Shadow(
            color="#000000",
            x=1.5,
            y=1.5
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.center,
            vertical=VerticalAlignment.top
        )
    )

    # Create text clip
    text_clip = Clip(
        asset=text_asset,
        duration=duration,
        offset=Offset(x=0, y=0.02)
    )

    # Create tracks
    video_track = Track()
    video_track.add_clip(0, video_clip)

    text_track = Track()
    text_track.add_clip(0, text_clip)

    # Add tracks to timeline (video first, then text on top)
    timeline.add_track(video_track)
    timeline.add_track(text_track)

    # Generate stream
    stream_url = timeline.generate_stream()

    return {
        "stream_url": stream_url,
        "metadata": {
            "video_id": video_id,
            "text": text,
            "duration": duration,
            "font_size": font_size,
            "font_color": font_color,
            "resolution": "1080x1080"
        }
    }
