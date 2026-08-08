import telebot

API_TOKEN = '8255937707:AAHZ4_F47ogwah3gz5jL_efDy_eKDDgGnqE'
bot = telebot.TeleBot(API_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "Салом! Боти SuperMarket омода аст ва фармоишҳоро қабул мекунад.")

@bot.message_handler(func=lambda message: True)
def handle_orders(message):
    print(f"Фармоиш гирифта шуд: {message.text}")
    bot.reply_to(message, "Фармоиши шумо қабул шуд! Менеҷери мо бо шумо тамос мегирад.")

print("Бот фаъол шуд...")
bot.polling()