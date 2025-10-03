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
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/EjF2TdFGyEA?rel=0&modestbranding=1"
            title="How to Use This Website Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}

