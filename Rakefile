require 'lib/bundle'

task :default => :test

desc 'Bundle source files.'
task :bundle do
  Bundle.new.bundle!
end

desc 'Minify bundled source.'
task :minify => :bundle do
  Bundle.new.minify!
end

desc 'Run tests.'
task :test do
  `open test/index.html`
end
