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

def get_stock_prices(symbol, range = '7D')
  function = %w[7D 1M 3M].include?(range) ?
    'TIME_SERIES_DAILY' : 'TIME_SERIES_WEEKLY'

  response = HTTParty.get(
    'https://www.alphavantage.co/query',
    query: {
      function: function,
      symbol: symbol,
      apikey: ENV['ALPHA_VANTAGE_API_KEY']
    }
  )

  data = response.parsed_response

  series_name = function == 'TIME_SERIES_DAILY' ?
    'Time Series (Daily)' : 'Weekly Time Series'

  series = data[series_name]

  series.map do |date, values|
    {
      time: date,
      value: values['4. close'].to_f
    }
  end.sort_by { |price| price[:time] }
end
