require 'sinatra'
require_relative 'stock_api'
require 'rack/utils'

helpers do
  def h(text)
    Rack::Utils.escape_html(text.to_s)
  end
end

get '/' do
    erb :index
end

get '/results' do
    query = params[:search_query].to_s.strip.upcase
    @stocks = query.empty? ? [] : search_stocks(query)

    erb :results
end

get '/chart/:symbol' do
    @symbol = params[:symbol]
    @prices = get_stock_prices(@symbol)

    erb :chart
end
