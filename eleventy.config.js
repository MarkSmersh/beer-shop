export default function(eleventyConfig) {  
    // Universal Shortcodes (Adds to Liquid, Nunjucks, 11ty.js)
    eleventyConfig.addShortcode("user", function(name, twitterUsername) {
      return `<div class="user">
      <div class="user_name">${name}</div>
      <div class="user_twitter">@${twitterUsername}</div>
      </div>`;
    });

    eleventyConfig.addPassthroughCopy("./assets/ico.png")
    eleventyConfig.addPassthroughCopy("./assets/logo.png")
  };