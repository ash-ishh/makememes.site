from videodb.editor import (
    Timeline, Track, Clip, VideoAsset, TextAsset,
    Font, Border, Background,
    Position, Fit, Offset,
    HorizontalAlignment, VerticalAlignment, Alignment, TextAlignment
)


def render(conn, params):
    """
    Creates a 2x2 grid meme with text overlays.
    Perfect for creating comparison memes with the same video clip.
    """
    video_id = params["video_id"]
    duration = params.get("duration", 10)

    # Text labels for each quadrant
    top_left_text = params.get("top_left_text", "Normal Day")
    top_right_text = params.get("top_right_text", "Birthday")
    bottom_left_text = params.get("bottom_left_text", "31st December")
    bottom_right_text = params.get("bottom_right_text", "New Year")

    # Optional: start position in source video
    video_start = params.get("video_start", 0)

    # Create timeline with vertical resolution for mobile/social media
    timeline = Timeline(conn)
    timeline.background = "#000000"
    timeline.resolution = "608x1080"  # 9:16 vertical format

    # Create the source video asset
    video_asset = VideoAsset(id=video_id, start=video_start, volume=1.0)

    # Track 1: Video clips in 2x2 grid
    video_track = Track()

    # Top-left quadrant
    top_left_clip = Clip(
        asset=video_asset,
        duration=duration,
        scale=0.5,  # Scale to 50% to fit in quadrant
        position=Position.top_left,
        fit=Fit.crop
    )
    video_track.add_clip(0, top_left_clip)

    # Top-right quadrant
    top_right_clip = Clip(
        asset=video_asset,
        duration=duration,
        scale=0.5,
        position=Position.top_right,
        fit=Fit.crop
    )
    video_track.add_clip(0, top_right_clip)

    # Bottom-left quadrant
    bottom_left_clip = Clip(
        asset=video_asset,
        duration=duration,
        scale=0.5,
        position=Position.bottom_left,
        fit=Fit.crop
    )
    video_track.add_clip(0, bottom_left_clip)

    # Bottom-right quadrant
    bottom_right_clip = Clip(
        asset=video_asset,
        duration=duration,
        scale=0.5,
        position=Position.bottom_right,
        fit=Fit.crop
    )
    video_track.add_clip(0, bottom_right_clip)

    # Track 2: Text overlays
    text_track = Track()

    # Top-left text
    top_left_text_asset = TextAsset(
        text=top_left_text,
        font=Font(family="Arial", size=28, color="#FFFFFF"),
        border=Border(color="#000000", width=2.0),
        background=Background(
            width=280,
            height=60,
            color="#000000",
            opacity=0.7,
            text_alignment=TextAlignment.center
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.left,
            vertical=VerticalAlignment.top
        )
    )
    top_left_text_clip = Clip(
        asset=top_left_text_asset,
        duration=duration,
        position=Position.top_left,
        offset=Offset(x=0.02, y=0.02)
    )
    text_track.add_clip(0, top_left_text_clip)

    # Top-right text
    top_right_text_asset = TextAsset(
        text=top_right_text,
        font=Font(family="Arial", size=28, color="#FFFFFF"),
        border=Border(color="#000000", width=2.0),
        background=Background(
            width=280,
            height=60,
            color="#000000",
            opacity=0.7,
            text_alignment=TextAlignment.center
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.right,
            vertical=VerticalAlignment.top
        )
    )
    top_right_text_clip = Clip(
        asset=top_right_text_asset,
        duration=duration,
        position=Position.top_right,
        offset=Offset(x=-0.02, y=0.02)
    )
    text_track.add_clip(0, top_right_text_clip)

    # Bottom-left text
    bottom_left_text_asset = TextAsset(
        text=bottom_left_text,
        font=Font(family="Arial", size=28, color="#FFFFFF"),
        border=Border(color="#000000", width=2.0),
        background=Background(
            width=280,
            height=60,
            color="#000000",
            opacity=0.7,
            text_alignment=TextAlignment.center
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.left,
            vertical=VerticalAlignment.bottom
        )
    )
    bottom_left_text_clip = Clip(
        asset=bottom_left_text_asset,
        duration=duration,
        position=Position.bottom_left,
        offset=Offset(x=0.02, y=-0.02)
    )
    text_track.add_clip(0, bottom_left_text_clip)

    # Bottom-right text
    bottom_right_text_asset = TextAsset(
        text=bottom_right_text,
        font=Font(family="Arial", size=28, color="#FFFFFF"),
        border=Border(color="#000000", width=2.0),
        background=Background(
            width=280,
            height=60,
            color="#000000",
            opacity=0.7,
            text_alignment=TextAlignment.center
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.right,
            vertical=VerticalAlignment.bottom
        )
    )
    bottom_right_text_clip = Clip(
        asset=bottom_right_text_asset,
        duration=duration,
        position=Position.bottom_right,
        offset=Offset(x=-0.02, y=-0.02)
    )
    text_track.add_clip(0, bottom_right_text_clip)

    # Add tracks to timeline
    timeline.add_track(video_track)
    timeline.add_track(text_track)

    # Generate stream
    stream_url = timeline.generate_stream()

    return {
        "stream_url": stream_url,
        "metadata": {
            "video_id": video_id,
            "duration": duration,
            "format": "2x2_grid_meme",
            "labels": {
                "top_left": top_left_text,
                "top_right": top_right_text,
                "bottom_left": bottom_left_text,
                "bottom_right": bottom_right_text
            }
        }
    }

