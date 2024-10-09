<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:rss="http://www.w3.org/2005/Atom"
  exclude-result-prefixes="rss"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <title>Web Feed • <xsl:value-of select="rss/channel/title"/></title>
        <style type="text/css">
        body{max-width:768px;margin:0 auto;font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";font-size:16px;line-height:1.5em}section{margin:30px 15px}h1{font-size:2em;margin:0.67em 0;line-height:1.125em}h2{border-bottom:1px solid #eaecef;padding-bottom:0.3em}.alert{background:#f5f5f5;padding:4px 12px;margin:0 -12px}a{color:#00965c;text-decoration:none}.entry h3{margin-bottom:0}.entry p{margin:4px 0}
        </style>
      </head>
      <body>
        <section>
          <div class="alert">
            <p><strong>This is a web feed</strong>, also known as an RSS feed. <strong>Subscribe</strong> by copying the URL from the address bar into your newsreader app.</p>
          </div>
        </section>
        <section>
          <xsl:apply-templates select="rss/channel" />
        </section>
        <section>
          <h2>Recent Items</h2>
          <xsl:apply-templates select="rss/channel/entry" />
        </section>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="rss/channel">
    <h1><xsl:value-of select="title"/>'s Web Feed Preview</h1>
    <p>This RSS feed provides the latest posts from <xsl:value-of select="title"/>'s blog.

    <a class="head_link" target="_blank">
      <xsl:attribute name="href">
        <xsl:value-of select="rss:link[@rel='alternate']/@href"/>
      </xsl:attribute>
      Visit Website &#x2192;
    </a>

    </p>
  </xsl:template>

  <xsl:template match="entry">
    <div class="entry">
      <h3>
        <a target="_blank">
          <xsl:attribute name="href">
            <xsl:value-of select="id"/>
          </xsl:attribute>
          <xsl:value-of select="title"/>
        </a>
      </h3>
      <p>
        <xsl:value-of select="summary"  disable-output-escaping="yes" />
      </p>
    </div>
  </xsl:template>

</xsl:stylesheet>