require 'rubygems'
require 'sinatra'
require 'json'

get '/' do
  redirect '/index.html'
end

post '/ajax' do
  JSON.generate({ :id => 1, :title => 'Foo amended', :body => '...', :foo => 'bar' })
end

put '/ajax/:id' do
  JSON.generate({ :id => 1, :title => 'Bar amended', :body => '...' })
end

delete '/ajax/:id' do
end
