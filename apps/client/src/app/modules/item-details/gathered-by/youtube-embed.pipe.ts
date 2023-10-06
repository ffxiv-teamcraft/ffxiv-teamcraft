import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tcYoutubeEmbed',
  pure: true,
  standalone: true
})
export class YoutubeEmbedPipe implements PipeTransform {
  transform(url: string): string {
    if (url.includes('embed')) {
      return url;
    }
    if (url.startsWith(`https://youtu.be/`)) {
      const id = url.replace('https://youtu.be/', '');
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.startsWith(`https://www.youtube.com/watch?v=`)) {
      const id = url.replace('https://www.youtube.com/watch?v=', '');
      return `https://www.youtube.com/embed/${id}`;
    }
    throw new Error(`Unsupported url ${url} for youtube embed transform`)
  }

}
