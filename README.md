# zhy072.github.io
personal webpage

## Edit Map

- Homepage structure and card links: `index.html`
- Glass effects, background, card sizing, and responsive layout: `styles.css`
- Live clock, time-based greeting, random music, message form, and detail titles: `script.js`
- Shared placeholder destination page: `detail.html`
- Message page: `message.html`

## Image Placeholders

The homepage uses these placeholder paths. The gradient placeholders still work before real images are added:

- `assets/avatar.jpg`: avatar
- `assets/image1.jpg`: top artwork
- `assets/image2.jpg`: latest post cover
- `assets/image3.jpg`: random pick cover

Place same-name images in `assets/`, then remove the placeholder text inside the matching card in `index.html`.

## Common Edits

- Change the name: search for `Zhili Yang`
- Change time-based greetings and Easter eggs: edit `greetingSlots` and `specialGreetings` in `script.js`
- Change Github / bilibili / email: search for `github.com/yourname`, `space.bilibili.com/yourid`, and `zhy072@ucsd.edu`
- Change destination page copy: edit `detailMap` in `script.js`

## Music

Put songs in `assets/music/`, then edit `audioTracks` in `script.js`:

- `assets/music/close-to-you.mp3`
- `assets/music/song1.mp3`
- `assets/music/song2.mp3`

Browsers may block audible autoplay. The code attempts autoplay first; if blocked, click the music card to play.
