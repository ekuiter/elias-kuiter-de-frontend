function projectPath(imageNumber) {
  imageNumber = imageNumber ? "/" + imageNumber : "";
  return "/" + App.helpers.getCategorySlug() + "/" + App.helpers.getProjectSlug() + imageNumber;
}

Template.projectRoute.helpers({
  columns: function() {
    return this.twoColumnLayout ? "columns-2" : "columns-1";
  },
  images: function() {
    var self = this;
    return self.imageIds.map(function(imageId, index) {
      var imageNumber = index + 1;
      return { imageNumber: imageNumber, imageUrl: self.imageUrl(imageNumber, "medium") };
    });
  },
  active: function(imageNumber) {
    return App.helpers.getImageNumber() === imageNumber ? "active" : "";
  },
  hasImageNumber: function() {
    return App.helpers.getImageNumber();
  },
  projectPath: projectPath
});

Template.projectDescription.helpers({
  descriptionHtml: function() {
    function parseWidgets(html) {
      var startTag = "{{", endTag = "}}";

      function tagIndex(html) {
        var startIndex = html.indexOf(startTag);
        if (startIndex === -1) return null;
        var endIndex = html.indexOf(endTag);
        if (endIndex === -1) return null;
        return { start: startIndex, end: endIndex };
      }

      function renderWidget(options) {
        if (options[0] === "action") {
          return Blaze.toHTMLWithData(Template.action, {
            title: options[1],
            url: "http://" + options[2].
              replace("_DOT_", ".").
              replace("ROOT_URL", __meteor_runtime_config__.ROOT_URL.slice(0, -1).replace("http://", "")),
            target: "_blank"
          });
        } else if (options[0] === "githubAction") {
          var title = options[2] || "Code ansehen";
          return Blaze.toHTMLWithData(Template.githubAction, { githubRepository: options[1], title: title });
        } else
          return "";
      }

      var tag = tagIndex(html);
      if (!tag) return html;
      var before = html.substring(0, tag.start);
      var after = html.substring(tag.end + endTag.length);
      var between = html.substring(tag.start + startTag.length, tag.end);
      var options = JSON.parse(between.replace(/&quot;/g, "\""));
      return before + renderWidget(options) + parseWidgets(after);
    }

    function parseLinks(html) {
      var match = html.match(/<a href="(.*?)">(.*?)<\/a>/);
      if (!match) return html;
      var parts = html.split(match[0]), before = parts.splice(0, 1)[0], after = parts.join(match[0]),
        url = match[1].replace("ROOT_URL", __meteor_runtime_config__.ROOT_URL.slice(0, -1)), title = match[2];
      var link = url.indexOf("://") === -1 ? '<a href="' + url : '<a href="' + url + '" target="_blank';
      return before + link + '">' + title + '</a>' + parseLinks(after);
    }

    return parseLinks(parseWidgets(this.descriptionHtml));
  }
});

Template.projectImage.helpers({
  imageUrl: function() {
    var imageNumber = App.helpers.getImageNumber();
    if (!this.imageIds[imageNumber - 1])
      App.renderNotFound();
    return this.imageUrl(imageNumber, "large");
  },
  nextImageNumber: function() {
    var imageNumber = App.helpers.getImageNumber();
    return imageNumber >= this.imageIds.length ? 1 : imageNumber + 1;
  },
  projectPath: projectPath
});