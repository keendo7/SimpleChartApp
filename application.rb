require 'sinatra'

get '/' do
    erb :index
end

get '/results' do
    @result = params[:search_query].to_s.strip.upcase
    return "Please enter a stock symbol or company name." if @result.empty?
    @result
end