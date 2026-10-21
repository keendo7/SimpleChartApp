require 'sinatra'
require 'json'
require_relative 'stock_api'

helpers do
  def h(text)
    Rack::Utils.escape_html(text.to_s)
  end
end

get '/' do
  erb :index
end

get '/api/stocks' do
  content_type :json

  query = params[:query].to_s.strip.upcase

  halt 400, { error: 'Search query is required' }.to_json if query.empty?

  search_stocks(query).to_json
end

get '/api/stocks/:symbol/prices' do
  content_type :json

  symbol = params[:symbol].to_s.strip.upcase

  halt 400, { error: 'Invalid symbol' }.to_json unless symbol.match?(/\A[A-Z0-9.^-]+\z/)

  get_stock_prices(symbol).to_json
end
