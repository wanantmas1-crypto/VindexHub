export function BackgroundVideo() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <video
        className="absolute inset-0 h-full w-full object-cover bg-site-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="https://images.pexels.com/videos/3129576/free-video-3129576.jpg?auto=compress&cs=tinysrgb&w=1600"
      >
        <source src="https://videos.pexels.com/video-files/3129576/3129576-hd_1920_1080_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-bg/80 dark:bg-bg/86" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.10),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.14),_transparent_55%)]" />
    </div>
  );
}