require 'rubygems'
require 'sinatra'
require 'erb'
require File.expand_path('../../lib/bundler', __FILE__)

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
