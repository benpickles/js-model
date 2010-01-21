desc 'Run test task.'
task :default => :test

desc 'Create minified versions of source files.'
task :minify do
  require 'fileutils'
  require 'rubygems'

  begin
    require 'closure-compiler'
  rescue LoadError
    puts '"closure-compiler" gem required for minification.'
    puts '  gem install closure-compiler'
    exit 1
  end

  FileUtils.rm_r('dist') if File.exists?('dist')
  FileUtils.mkdir_p('dist')

  Dir['src/*.js'].each do |path|
    minified = Closure::Compiler.new.compile(File.open(path, 'r'))
    basename = File.basename(path, '.js')

    File.open("dist/#{basename}.min.js", 'w') do |f|
      f.write(minified)
    end
  end
end

desc 'Run tests.'
task :test do
  `open test/index.html`
end
