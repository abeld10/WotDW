# Author: Prof. MM Ghassemi <ghassem3@msu.edu>

#--------------------------------------------------
# Import Requirements
#--------------------------------------------------
import os
from flask import Flask
from flask_socketio import SocketIO
from flask_failsafe import failsafe
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
import atexit


socketio = SocketIO()

#--------------------------------------------------
# Create a Failsafe Web Application
#--------------------------------------------------
@failsafe
def create_app(debug=False):
	load_dotenv()  # This loads the .env file at the start of your app
	app = Flask(__name__)

	# NEW IN HOMEWORK 3 ----------------------------
	# This will prevent issues with cached static files
	app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
	app.debug = debug
	# The secret key is used to cryptographically-sign the cookies used for storing the session data.
	app.secret_key = 'AKWNF1231082fksejfOSEHFOISEHF24142124124124124iesfhsoijsopdjf'
	# ----------------------------------------------

	from .utils.database.database import database
	db = database()
	db.createTables(purge=True)
	
	# NEW IN HOMEWORK 3 ----------------------------
	# This will create a user

	# !!!I changed the password from "password" to "Password1" for better password security!!!
	db.createUser(email='owner@email.com' ,password='Password1', role='owner')
	db.createUser(email='guest@email.com' ,password='Password1', role='guest')

	db.createGameUser(username='owner' ,password='Password1', role='owner')
	db.createGameUser(username='guest' ,password='Password1', role='guest')
	
	# ----------------------------------------------

	socketio.init_app(app)

	with app.app_context():
		from . import routes
		scheduler = BackgroundScheduler()
		scheduler.add_job(func=db.update_daily_word, trigger='cron', hour=19, minute=41) #Updates daily word every day
		scheduler.add_job(func=routes.reset_leaderboard_daily, trigger='cron', hour=0) #Updates daily word every day
		scheduler.start()
		atexit.register(lambda: scheduler.shutdown())
	return app
