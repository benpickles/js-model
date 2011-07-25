$: << 'lib'

autoload :Bundler, 'bundler'
autoload :Docs, 'docs'

desc 'Create bundled and minified source files.'
task :bundle do
  Bundler.bundle!
end

desc 'Build docs.'
task :docs do
  Docs.build
end
