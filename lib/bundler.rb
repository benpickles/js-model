require 'fileutils'

require 'rubygems'
require 'closure-compiler'
require 'fewer'

class Bundler
  DIST_DIR = File.expand_path('../../dist', __FILE__)
  SRC_DIR = File.expand_path('../../src', __FILE__)

  class << self
    def bundle!
      FileUtils.mkdir_p(DIST_DIR)

      write "#{DIST_DIR}/js-model-#{version}.js" do
        Fewer::Engines::Js.new(SRC_DIR, files).read
      end

      write "#{DIST_DIR}/js-model-#{version}.min.js" do
        Fewer::Engines::Js.new(SRC_DIR, files, :min => true).read
      end
    end

    def bundled
      Fewer::Engines::Js.new(SRC_DIR, files).read
    end

    private
      def files
        @files ||= %w(
          model
          model_callbacks
          model_class_methods
          model_errors
          model_instance_methods
          model_local_storage
          model_log
          model_module
          model_rest
          model_uid
          model_utils
          model_version
          model_base
        )
      end

      def header
        @header ||= File.read(File.join(SRC_DIR, 'header.js'))
      end

      def version
        @version ||= File.read('VERSION').strip
      end

      def write(path, &block)
        puts "Generating #{path}"

        File.open(path, 'w') do |f|
          f.write header.gsub('@VERSION', version)
          f.write yield.gsub('@VERSION', version)
        end
      end
  end
end
