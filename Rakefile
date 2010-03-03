autoload :Bundle, 'lib/bundle'

task :default => :test

desc 'Bundle source files.'
task :bundle do
  Bundle.new.bundle!
end

desc 'Minify bundled source.'
task :minify => :bundle do
  Bundle.new.minify!
end

desc 'Boot test server - run tests at http://localhost:9393/'
task :test do
  exec 'cd test && shotgun app.rb'
end
