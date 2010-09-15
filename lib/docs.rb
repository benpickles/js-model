require 'erb'
require 'nokogiri'
require 'rdiscount'
require 'simplabs/highlight'
require 'toc'

class Docs
  class << self
    def build
      @version = File.read(File.expand_path('../../VERSION', __FILE__)).chomp
      @file_size = file_size
      @file_size_min = file_size(:min)
      @sections = [
        markdown('getting_started'),
        markdown('persistence'),
        markdown('sammy'),
        '<h2>API</h2>' +
          markdown('model') +
          markdown('class_properties') +
          markdown('instance_properties') +
          markdown('errors') +
          markdown('persistence_interface')
      ]

      erb = ERB.new(template, nil, '-')

      doc = Nokogiri::HTML(erb.result(binding))
      doc.at_css('nav').inner_html = Toc.build(doc).to_html

      unless ENV['NOCODE']
        doc.css('pre code').each do |node|
          code = node.content
          lang = code.index('::') || code.index('module') ? :ruby : :javascript
          node.inner_html = Simplabs::Highlight.highlight(lang, code)
        end
      end

      File.open(File.expand_path('../../index.html', __FILE__), 'w') do |f|
        f.write doc.to_html
      end
    end

    private
      def analytics
        <<-EOF
<script type="text/javascript">
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-117680-14']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
</script>
EOF
      end

      def file_size(min = nil)
        bytes = File.size(File.expand_path("../../dist/js-model-#{@version}#{'.min' if min}.js", __FILE__))
        '%.1f' % (bytes.to_f / 1000)
      end

      def markdown(file_name)
        md = File.expand_path("../../docs/#{file_name}.md", __FILE__)
        RDiscount.new(File.read(md), :smart).to_html
      end

      def template
        File.read(File.expand_path('../../docs/template.erb', __FILE__))
      end
  end
end
