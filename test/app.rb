require 'rubygems'
require 'sinatra'
require 'rack/contrib'
require 'json'
require 'erb'

require File.expand_path('../../lib/bundler', __FILE__)
require File.expand_path('../../lib/jsonp', __FILE__)

use Rack::JSONP

def json!
  content_type 'application/json'
end

get '/' do
  erb :index
end

get '/js-model.js' do
  content_type 'application/x-javascript'
  Bundler.bundled
end

get '/tests/:name' do
  content_type 'application/x-javascript'
  File.read("tests/#{params[:name]}")
end

get '/posts' do
  JSON.generate([
    { :id => 1, :title => 'Bar' },
    { :id => 2, :title => 'Foo' }
  ])
end

get '/posts-single' do
  JSON.generate({ :id => 1, :title => 'Bar' })
end

# Success.
post '/posts' do
  json!
  JSON.generate({ :id => 1, :title => 'Foo amended', :body => '...', :foo => 'bar' })
end

post '/root/:root_id/nested/:nested_id/posts' do
  json!
  JSON.generate({ :id => 1, :title => 'Nested created', :body => '...', :root_id => 3, :nested_id => 2 })
end

put '/posts/:id' do
  json!
  JSON.generate({ :id => 1, :title => 'Bar amended', :body => '...' })
end

put '/root/:root_id/nested/:nested_id/posts/:id' do
  json!
  JSON.generate({ :id => 1, :title => 'Nested amended', :body => '...', :root_id => 3, :nested_id => 2 })
end

delete '/posts/:id' do
  json!
  ' '
end

delete '/root/:root_id/nested/:nested_id/posts/:id' do
  json!
  ' '
end

# Blank response (Rails' `head :ok`)
put '/posts-empty-response/:id' do
  json!
  ' '
end

delete '/posts-empty-response/:id' do
  json!
  ' '
end

# Failure.
post '/posts-failure' do
  json!
  status 500
end

put '/posts-failure/:id' do
  json!
  status 500
end

delete '/posts-failure/:id' do
  json!
  status 500
end

# Validations.
post '/posts-validations' do
  json!
  status 422
  JSON.generate({
    :title => ['should not be "Foo"', 'should be "Bar"']
  })
end

put '/posts-validations/:id' do
  json!
  status 422
  JSON.generate({
    :title => ['should not be "Foo"', 'should be "Bar"']
  })
end

delete '/posts-validations/:id' do
  json!
  status 422
  JSON.generate({
    :title => ['must do something else before deleting']
  })
end

get '/jsonp/posts' do
  json!
  JSON.generate([
    { :title => 'a' },
    { :title => 'b' }
  ])
end

get '/jsonp/posts-slooow' do
  sleep 2
  json!
  JSON.generate([
    { :title => 'a' },
    { :title => 'b' }
  ])
end
