# Personal Linktree Website
This repository contains the source code for my personal link-in-bio website, hosted at [xhvsh.github.io](https://xhvsh.github.io/)

## Notes
- Made for personal use; not intended as a reusable template.
- Features, content, and design may change significantly in future updates.

## Features
- **Interactive Mouse Trailer**: Custom cursor trailer that follows the mouse and expands with a gradient on social media hover.
- **Dynamic Link Generation**: Links are generated from a JavaScript array, making updates simple.
- **Scroll Animations**: Elements fade and slide into view as you scroll, using the `IntersectionObserver` API on mobile devices.
- **Responsive Design**: Layout adapts to different screen sizes. On small screens, the link grid becomes a list and the mouse trailer is disabled.
- **Custom 404 Page**: Animated "Page Not Found" page with a rolling number effect.

## Technologies Used
- **HTML5**: Structures content.
- **CSS3**: Handles styling, animations, and responsive design with modern features like custom properties.
- **Vanilla JavaScript**: Powers dynamic functionality, including link generation, the mouse trailer, and scroll-triggered animations.

## Project Structure
```
Linktree
├── 404.html     # Custom 404 page
├── 404.css      # Styles for the 404 page
├── 404.js       # Animation logic for the 404 page
├── index.html   # Main landing page
├── style.css    # Main stylesheet
├── script.js    # Core JavaScript for interactivity
└── img/         # Image assets
```

## Deployment
- The website is currently hosted on GitHub Pages
- A standalone version will be available at a separate URL in the future
