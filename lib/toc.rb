module Toc
  def self.build(doc)
    hs = doc.search('*').select { |node|
      node.name =~ /^h[2-4]/
    }

    current = Node.new(0)

    hs.each do |h|
      node = Node.new(h.name.sub('h', '').to_i, h)

      if current
        parent = current.nearest_parent(node)
        parent << node
      end

      id = [node.id]

      if doc.at_css('#' + id.join('-'))
        id.unshift(parent.id)
      end

      node.node['id'] = id.join('-')

      current = node
    end

    current.root
  end

  class Node
    attr_accessor :children, :depth, :node, :parent

    def initialize(depth, node = nil)
      @children = []
      @depth = depth
      @node = node
    end

    def <<(node)
      node.parent = self
      @children << node
    end

    def id
      node['id'] || generate_id
    end

    def nearest_parent(node)
      parent = self

      while parent.depth >= node.depth do
        parent = parent.parent if parent.parent
      end

      parent
    end

    def root
      node = self

      while node.parent
        node = node.parent
      end

      node
    end

    def text
      node.
        inner_html({ :encoding => 'US-ASCII' }).
        gsub(/<[^>]+>/, '').
        sub(/\([^\)]+\)/, '()')
    end

    def to_html
      html = node ? %Q(<li><a href="##{node['id']}">#{text}</a>) : ''

      if children.any?
        html << '<ol>'

        children.inject(html) do |tot, node|
          tot << node.to_html
        end

        html << '</ol>'
      end

      html
    end

    private
      def generate_id
        text.
          gsub(/[^\w]/, '-').
          gsub(/-+/, '-').
          gsub(/^-|-$/, '').
          downcase
      end
  end
end
