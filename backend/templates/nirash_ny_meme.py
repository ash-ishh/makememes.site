from videodb.editor import (
    Timeline, Track, Clip, VideoAsset, TextAsset,
    Position, Font, Border, Shadow,
    Alignment, HorizontalAlignment, VerticalAlignment
)


def render(conn, params):
    """
    Creates a 2x2 grid layout meme showing the same video in all four quadrants
    with year labels (2023, 2024, 2025, 2026) overlay on each quadrant.
    Perfect for creating "year progression" meme videos.
    """
    video_id = params["video_id"]
    duration = params.get("duration", 20)
    resolution = params.get("resolution", "1280x720")
    text_size = params.get("text_size", 40)
    text_color = params.get("text_color", "#FFD700")

    top_left_text = params.get("top_left_text", "1 jan 2023")
    top_right_text = params.get("top_right_text", "1 jan 2024")
    bottom_left_text = params.get("bottom_left_text", "1 jan 2025")
    bottom_right_text = params.get("bottom_right_text", "1 jan 2026")

    # Create timeline
    timeline = Timeline(conn)
    timeline.background = "#000000"
    timeline.resolution = resolution

    # Create the video asset (will be reused for all 4 quadrants)
    video_asset = VideoAsset(id=video_id, start=0, volume=1.0)

    # Create the 4 video clips in a 2x2 grid
    # Top-left quadrant
    top_left_video = Clip(
        asset=video_asset,
        duration=duration,
        scale=0.5,
        position=Position.top_left
    )

    # Top-right quadrant
    top_right_video = Clip(
        asset=video_asset,
        duration=duration,
        scale=0.5,
        position=Position.top_right
    )

    # Bottom-left quadrant
    bottom_left_video = Clip(
        asset=video_asset,
        duration=duration,
        scale=0.5,
        position=Position.bottom_left
    )

    # Bottom-right quadrant
    bottom_right_video = Clip(
        asset=video_asset,
        duration=duration,
        scale=0.5,
        position=Position.bottom_right
    )

    # Create text overlays for each quadrant
    # Top-left text
    top_left_text_asset = TextAsset(
        text=top_left_text,
        font=Font(
            family="Arial",
            size=text_size,
            color=text_color,
            opacity=1.0
        ),
        border=Border(
            color="#000000",
            width=2.0
        ),
        shadow=Shadow(
            color="#000000",
            x=3.0,
            y=3.0
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.left,
            vertical=VerticalAlignment.top
        )
    )

    top_left_text_clip = Clip(
        asset=top_left_text_asset,
        duration=duration,
        position=Position.top_left
    )

    # Top-right text
    top_right_text_asset = TextAsset(
        text=top_right_text,
        font=Font(
            family="Arial",
            size=text_size,
            color=text_color,
            opacity=1.0
        ),
        border=Border(
            color="#000000",
            width=2.0
        ),
        shadow=Shadow(
            color="#000000",
            x=3.0,
            y=3.0
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.right,
            vertical=VerticalAlignment.top
        )
    )

    top_right_text_clip = Clip(
        asset=top_right_text_asset,
        duration=duration,
        position=Position.top_right
    )

    # Bottom-left text
    bottom_left_text_asset = TextAsset(
        text=bottom_left_text,
        font=Font(
            family="Arial",
            size=text_size,
            color=text_color,
            opacity=1.0
        ),
        border=Border(
            color="#000000",
            width=2.0
        ),
        shadow=Shadow(
            color="#000000",
            x=3.0,
            y=3.0
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.left,
            vertical=VerticalAlignment.bottom
        )
    )

    bottom_left_text_clip = Clip(
        asset=bottom_left_text_asset,
        duration=duration,
        position=Position.bottom_left
    )

    # Bottom-right text
    bottom_right_text_asset = TextAsset(
        text=bottom_right_text,
        font=Font(
            family="Arial",
            size=text_size,
            color=text_color,
            opacity=1.0
        ),
        border=Border(
            color="#000000",
            width=2.0
        ),
        shadow=Shadow(
            color="#000000",
            x=3.0,
            y=3.0
        ),
        alignment=Alignment(
            horizontal=HorizontalAlignment.right,
            vertical=VerticalAlignment.bottom
        )
    )

    bottom_right_text_clip = Clip(
        asset=bottom_right_text_asset,
        duration=duration,
        position=Position.bottom_right
    )

    # Create track and add all clips
    track = Track()

    # Add video clips
    track.add_clip(0, top_left_video)
    track.add_clip(0, top_right_video)
    track.add_clip(0, bottom_left_video)
    track.add_clip(0, bottom_right_video)

    # Add text overlays
    track.add_clip(0, top_left_text_clip)
    track.add_clip(0, top_right_text_clip)
    track.add_clip(0, bottom_left_text_clip)
    track.add_clip(0, bottom_right_text_clip)

    # Add track to timeline
    timeline.add_track(track)

    # Generate stream
    stream_url = timeline.generate_stream()

    return {
        "stream_url": stream_url,
        "metadata": {
            "video_id": video_id,
            "duration": duration,
            "resolution": resolution,
            "text_size": text_size,
            "text_color": text_color,
            "top_left_text": top_left_text,
            "top_right_text": top_right_text,
            "bottom_left_text": bottom_left_text,
            "bottom_right_text": bottom_right_text
        }
    }
