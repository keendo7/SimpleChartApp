require 'dotenv/load'
require 'httparty'

def search_stocks(stock)
    response = HTTParty.get(
    "https://www.alphavantage.co/query",
        query:{
            function: 'SYMBOL_SEARCH',
            keywords: stock,
            apikey: ENV['ALPHA_VANTAGE_API_KEY']
        }
    )

    data = response.parsed_response.fetch('bestMatches', [])
    data.map { |match| {name: match['2. name'], symbol: match['1. symbol']} }
end

def get_stock_prices(symbol)
    response = HTTParty.get(
    "https://www.alphavantage.co/query",
        query:{
            function: 'TIME_SERIES_DAILY',
            symbol: symbol,
            apikey: ENV['ALPHA_VANTAGE_API_KEY']
        }
    )

    data = response.parsed_response.fetch('Time Series (Daily)', {})
    data.map do |date, prices| {
        time: date, value: prices['4. close'].to_f
        } 
    end.sort_by { |entry| entry[:time] }
end