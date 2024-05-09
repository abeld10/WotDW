# Author: Prof. MM Ghassemi <ghassem3@msu.edu>
from flask import current_app as app, jsonify, send_from_directory
from flask import render_template, redirect, request, session, url_for, copy_current_request_context
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect
from .utils.database.database  import database
from werkzeug.datastructures   import ImmutableMultiDict
from pprint import pprint
import json
import random
import functools
from . import socketio
import os
import http.client



db = database()


#######################################################################################
# AUTHENTICATION RELATED
#######################################################################################
def login_required(func):
    @functools.wraps(func)
    def secure_function(*args, **kwargs):
        if "email" not in session:
            return redirect(url_for("login", next=request.url))
        return func(*args, **kwargs)
    return secure_function


def game_login_required(func):
    @functools.wraps(func)
    def secure_function(*args, **kwargs):
        if "username" not in session:
            return redirect(url_for("gamelogin", next=request.url))
        return func(*args, **kwargs)
    return secure_function



def getUser():
	return db.reversibleEncrypt('decrypt', session.get('email')) if 'email' in session else 'Unknown'


def getGameUser():
	return db.reversibleEncrypt('decrypt', session.get('username')) if 'username' in session else 'Unknown'

@app.route('/gamelogin')
def gamelogin():
    return render_template('gamelogin.html', message=None, user=getGameUser())


@app.route('/login.html')
def loginhtml():
	return redirect('/login')

@app.route('/login')
def login():
	return render_template('login.html', message=None, user=getUser())


@app.route('/logout')
def logout():
	session.pop('email', default=None)
	return redirect('/')


@app.route('/gamelogout')
def gamelogout():
	session.pop('username', default=None)
	session.pop('user_id', default=None)
	session.pop('seen_instructions', default=None) 
	session.pop('has_played')
	session.pop('is_winner')	
	return redirect('/gamelogin')






@app.route('/processlogin', methods = ["POST","GET"])
def processlogin():
	form_fields = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))
	auth_reply = db.authenticate(form_fields['email'],form_fields['password'])
	if auth_reply['success']:

		encrypted_email = db.reversibleEncrypt('encrypt', form_fields['email'])
		encrypted_user_id = db.reversibleEncrypt('encrypt', str(auth_reply['user_id']))  # Assuming user_id is an integer


		session['email'] = encrypted_email
		session['user_id'] = encrypted_user_id
		return jsonify({'success': 1})
	else:
		message = auth_reply['message']
		mess_dict = {"message" : message}
		return jsonify({'success': 0, "message": message})
	



@app.route('/processgamelogin', methods = ["POST","GET"])
def processgamelogin():
	form_fields = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))
	auth_reply = db.gameAuthenticate(form_fields['username'],form_fields['password'])
	if auth_reply['success']:

		encrypted_username = db.reversibleEncrypt('encrypt', form_fields['username'])
		encrypted_user_id = db.reversibleEncrypt('encrypt', str(auth_reply['user_id']))  # Assuming user_id is an integer
		encrypted_has_played = db.reversibleEncrypt('encrypt', "False")
		encrypted_is_winter = db.reversibleEncrypt('encrypt', "False")


		session['username'] = encrypted_username
		session['user_id'] = encrypted_user_id
		session['has_played'] = encrypted_has_played
		session['is_winner'] = encrypted_is_winter


		return jsonify({'success': 1})
	else:
		message = auth_reply['message']
		mess_dict = {"message" : message}
		return jsonify({'success': 0, "message": message})



@app.route('/processregister', methods = ["POST","GET"])
def processregister():
	form_fields = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))
	create_reply = db.createUser(form_fields['email'],form_fields['password'])
	if create_reply['success']:

		encrypted_email = db.reversibleEncrypt('encrypt', form_fields['email'])
		encrypted_user_id = db.reversibleEncrypt('encrypt', str(create_reply['user_id']))  # Assuming user_id is an integer


		session['email'] = encrypted_email
		session['user_id'] = encrypted_user_id
		#return render_template('home.html', useremail = form_fields['email'], userid = create_reply['user_id'])
		return jsonify({'success': 1})
	else:
		message = create_reply['message']
		mess_dict = {'message': message}
		return jsonify({'success': 0, "message": message})


@app.route('/processgameregister', methods = ["POST","GET"])
def processgameregister():
	form_fields = dict((key, request.form.getlist(key)[0]) for key in list(request.form.keys()))
	create_reply = db.createGameUser(form_fields['username'],form_fields['password'])
	if create_reply['success']:
		encrypted_username = db.reversibleEncrypt('encrypt', form_fields['username'])
		encrypted_user_id = db.reversibleEncrypt('encrypt', str(create_reply['user_id']))  
		encrypted_has_played = db.reversibleEncrypt('encrypt', "False")
		encrypted_is_winter = db.reversibleEncrypt('encrypt', "False")


		session['has_played'] = encrypted_has_played
		session['is_winner'] = encrypted_is_winter
		session['username'] = encrypted_username
		session['user_id'] = encrypted_user_id
		#return render_template('home.html', useremail = form_fields['email'], userid = create_reply['user_id'])
		return jsonify({'success': 1})
	else:
		message = create_reply['message']
		mess_dict = {'message': message}
		return jsonify({'success': 0, "message": message})
	




#######################################################################################
# CHATROOM RELATED
#######################################################################################
@app.route('/chat')
@login_required
def chat():
    return render_template('chat.html', user=getUser())

@socketio.on('joined', namespace='/chat')
def joined(message):
	join_room('main')
	emit('status', {'msg': getUser() + ' has entered the room.', 'style': 'width: 100%;color:blue;text-align: right'}, room='main')


@socketio.on('send_message', namespace='/chat')
def messagefunction(message):
	is_owner = getUser() == 'owner@email.com'
	join_room('main')
	emit('receive_message', {'msg': message['msg'], 'isOwner': is_owner}, room='main')


@socketio.on('left', namespace='/chat')
def leftfunction(message):
	emit('status', {'msg': getUser() + ' has left the room.', 'style': 'width: 100%;color:red;text-align: right'}, room='main')
	leave_room('main')



#######################################################################################
# OTHER
#######################################################################################
@app.route('/')
def root():
	return redirect('/home')

@app.route('/home.html')
def homehtml():
	return redirect('/home')

@app.route('/home')
def home():
	#print(db.query('SELECT * FROM users'))
	x = random.choice(['I started university when I was a wee lad of 15 years.','I have a pet sparrow.','I write poetry.'])
	return render_template('home.html', user=getUser(), fun_fact = x)

@app.route('/projects.html')
def projectshtml():
	return redirect('/projects')

@app.route('/projects')
def projects():
	#x     = random.choice(['I started university when I was a wee lad of 15 years.','I have a pet sparrow.','I write poetry.'])
	#return render_template('home.html', fun_fact = x)
	return render_template('projects.html', user=getUser())

@app.route('/piano.html')
def pianohtml():
	return redirect('/piano')

@app.route('/piano')
def piano():
	#x     = random.choice(['I started university when I was a wee lad of 15 years.','I have a pet sparrow.','I write poetry.'])
	#return render_template('home.html', fun_fact = x)
	return render_template('piano.html', user=getUser())

@app.route('/resume.html')
def resumehtml():
	return redirect('/resume')

@app.route('/resume')
def resume():
	resume_data = db.getResumeData()
	#pprint(resume_data)
	return render_template('resume.html', resume_data = resume_data, user=getUser())

@app.route('/processfeedback', methods=['POST'])
def process():
	#resume_data = db.getResumeData()
	#pprint(resume_data)
	feedback = request.form
	name = feedback.get('name')
	email = feedback.get('email')
	comment = feedback.get('message')
	db.insertRows('feedback',['name','email','comment'],[[name,email,comment]])
	form_data = db.getFeedbackData()

	return render_template('feedback.html', form_data = form_data, user=getUser())

@app.route("/static/<path:path>")
def static_dir(path):
    return send_from_directory("static", path)

@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r


@app.route('/game')
@game_login_required
def game():
	dailyword = get_target_word()
	#print("DAILY WORD: ",dailyword )
	gridSize = len(dailyword)

	if 'seen_instructions' not in session:
		encrypted_seen_instructions = db.reversibleEncrypt('encrypt', "True")
		session['seen_instructions'] = encrypted_seen_instructions

		show_instructions = True
	else:
		show_instructions = False

	return render_template('game.html', user=getGameUser(), word=dailyword, gridSize = gridSize, show_instructions=show_instructions)


def format_time(seconds):
    minutes = seconds // 60
    seconds = seconds % 60
    return f"{minutes}m:{seconds:02d}s"

@app.route('/leaderboard')
@game_login_required
def leaderboard():
	leaderboard_results = db.getLeaderboard()
	#print(leaderboard_results)
	format_results = [{'User': user['User'], 'best_time': format_time(user['best_time'])} for user in leaderboard_results]

	#format_results =[]
	#has_played = check_if_user_played_today(getGameUser())  # Implement this function
	encrypted_has_played = session.get('has_played')
	#print("encrypted:",encrypted_has_played)
	has_played = db.reversibleEncrypt('decrypt',encrypted_has_played)

	if has_played == "False":
		return render_template('leaderboard.html', user=getGameUser(), format_results = format_results,has_played=db.reversibleEncrypt('decrypt',encrypted_has_played), is_winner=db.reversibleEncrypt('decrypt',session['is_winner']))
	else:
		return render_template('leaderboard.html', hidden_word=get_target_word(), user=getGameUser(), format_results = format_results,has_played=db.reversibleEncrypt('decrypt',encrypted_has_played), is_winner=db.reversibleEncrypt('decrypt',session['is_winner']))

@app.route('/validate-guess', methods=['GET'])
def validateGuess():
    #rapid_api_key = os.environ.get('rapid_api_key')
    #guess = request.json.get('guess')
    guess = request.args.get('guess')

    conn = http.client.HTTPSConnection("wordsapiv1.p.rapidapi.com")
    headers = {
        'X-RapidAPI-Key': "0e6b4f4e31msh32ec98e8bf184f7p1237bbjsn260ce8376c87",
        'X-RapidAPI-Host': "wordsapiv1.p.rapidapi.com"
    }

    try:
        conn.request("GET", "/words/" + guess + "/definitions", headers=headers)
        res = conn.getresponse()
        data = res.read()

        # Check if the word is found
        if res.status == 200:
            #print("VALID")
            return jsonify({'isValid': True, 'message': 'Valid word'})
        else:
            #print("INVALID")
            return jsonify({'isValid': False, 'message': 'Invalid word'})
    except Exception as e:
        #print(f"Error making API request: {e}")
        return jsonify({'error': 'Error making API request'}), 500

    finally:
        conn.close()

@app.route('/record-win', methods=['POST'])
@game_login_required
def record_win():
	data = request.get_json()
	timeSeconds = data.get('timeSeconds')
	#print("type: ",type(timeSeconds))
	#print("timeSeconds: " , timeSeconds)
	encrypted_username = session.get('username') # make sure to encrypt session username
	username = db.reversibleEncrypt('decrypt', encrypted_username)
    # Logic to record the win in the database
    # You might use user_id and time_taken to update the database
	encrypted_has_played = session['has_played']
	has_played = db.reversibleEncrypt('decrypt', encrypted_has_played)
	in_leaderboard = db.authenticateLeaderboard(username)['success']
	if has_played == "False" or not in_leaderboard:
		insertId = db.insertRows("leaderboard",['username','time'],[[username,timeSeconds]])
		
		encrypted_has_played_again = db.reversibleEncrypt('encrypt', "True")
		encrypted_is_winner_again = db.reversibleEncrypt('encrypt', "True")

		session['has_played'] = encrypted_has_played_again
		session['is_winner'] = encrypted_is_winner_again 
	return jsonify({'success': True})


def reset_leaderboard_daily():
    with app.app_context():
        db.query("TRUNCATE TABLE leaderboard;")


def get_target_word():
	target_word = db.select_daily_word()
	target_word = target_word[0]['word'].upper()
	return target_word


@app.route('/check-guess', methods=['POST'])
def check_guess():
	guess = request.json.get('guess')
	target_word = get_target_word()
	response = {
        'correct': [guess[i] == target_word[i] for i in range(len(target_word))], #list of bools
        'present': [guess[i] in target_word and guess[i] != target_word[i] for i in range(len(target_word))],
        'isComplete': guess == target_word
    }
	return jsonify(response)


@app.route('/record-loss', methods=['POST'])
@game_login_required
def reocrd_loss():
	encrypted_has_played_again = db.reversibleEncrypt('encrypt', "True")
	encrypted_is_winner_again = db.reversibleEncrypt('encrypt', "False")
	session['has_played'] = encrypted_has_played_again
	session['is_winner'] = encrypted_is_winner_again 
	return jsonify({'success': True})


