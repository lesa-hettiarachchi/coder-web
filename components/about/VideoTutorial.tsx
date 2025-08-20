import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VideoTutorial() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Use This Website</CardTitle>
        <CardDescription>
          Watch this tutorial to learn how to navigate and use all the features effectively
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {/* Replace this div with your actual video */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">
                Video Tutorial
              </p>
              <p className="text-sm text-muted-foreground">
                Coming Soon
              </p>
            </div>
          </div>
          
          {/* Example video implementations - uncomment and modify as needed */}
          
          {/* Local Video File */}
          {/* 
          <video 
            className="w-full h-full rounded-lg" 
            controls 
            poster="/path-to-your-thumbnail.jpg"
          >
            <source src="/path-to-your-video.mp4" type="video/mp4" />
            <source src="/path-to-your-video.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video> 
          */}
          
          {/* YouTube Embed */}
          {/*
          <iframe
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID?rel=0"
            title="How to Use This Website Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          */}
          
          {/* Vimeo Embed */}
          {/*
          <iframe
            className="w-full h-full rounded-lg"
            src="https://player.vimeo.com/video/YOUR_VIDEO_ID"
            title="How to Use This Website Tutorial"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
          */}
        </div>
      </CardContent>
    </Card>
  );
}