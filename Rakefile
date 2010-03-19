autoload :Bundle, 'lib/bundle'

task :default => :test

desc 'Bundle source files.'
task :bundle do
  @bundle = Bundle.new
  @bundle.bundle!
end

desc 'Minify bundled source.'
task :minify => :bundle do
  @bundle.minify!
end

desc 'Boot test server - run tests at http://localhost:4567/'
task :test do
  exec 'cd test && ruby app.rb'
end
