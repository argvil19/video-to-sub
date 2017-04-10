# video-to-sub
Send video files, returns an array with subtitles and a link to the original video hosted on a chinese CDN.

```
npm install
npm start
```

Use `POST /video` adding the video under the `video` prop on request's body.

### Requirements

* Python
* ffmpeg
