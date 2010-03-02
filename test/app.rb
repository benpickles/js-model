require 'rubygems'
require 'sinatra'
require 'json'

get '/' do
  redirect '/index.html'
end

# Success.
post '/posts' do
  JSON.generate({ :id => 1, :title => 'Foo amended', :body => '...', :foo => 'bar' })
end

put '/posts/:id' do
  JSON.generate({ :id => 1, :title => 'Bar amended', :body => '...' })
end

delete '/posts/:id' do
end
