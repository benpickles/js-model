autoload :Bundler, 'lib/bundler'

task :default => :test

desc 'Create bundled and minified source files.'
task :bundle do
  Bundler.bundle!
end

desc 'Boot test server - run tests at http://localhost:4567/'
task :test do
  exec 'cd test && ruby app.rb'
end
