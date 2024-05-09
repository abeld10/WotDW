import mysql.connector
import glob
import json
import csv
from io import StringIO
import itertools
import hashlib
import os
import cryptography
from cryptography.fernet import Fernet
from math import pow
import random


class database:

    def __init__(self, purge = False):

        # Grab information from the configuration file
        self.database       = 'db'
        self.host           = '127.0.0.1'
        self.user           = 'master'
        self.port           = 3306
        self.password       = 'master'
        self.tables         = ['institutions', 'positions', 'experiences', 'skills','feedback', 'users','gameusers', 'leaderboard', 'daily_word']

        # NEW IN HW 3-----------------------------------------------------------------
        self.encryption     =  {   'oneway': {'salt' : b'averysaltysailortookalongwalkoffashortbridge',
                                                 'n' : int(pow(2,5)),
                                                 'r' : 9,
                                                 'p' : 1
                                             },
                                'reversible': { 'key' : '7pK_fnSKIjZKuv_Gwc--sZEMKn2zc8VvD6zS96XcNHE='}
                                }
        #-----------------------------------------------------------------------------

    def query(self, query = "SELECT * FROM users", parameters = None):

        cnx = mysql.connector.connect(host     = self.host,
                                      user     = self.user,
                                      password = self.password,
                                      port     = self.port,
                                      database = self.database,
                                      charset  = 'latin1'
                                     )


        if parameters is not None:
            cur = cnx.cursor(dictionary=True)
            cur.execute(query, parameters)
        else:
            cur = cnx.cursor(dictionary=True)
            cur.execute(query)

        # Fetch one result
        row = cur.fetchall()
        cnx.commit()

        if "INSERT" in query:
            cur.execute("SELECT LAST_INSERT_ID()")
            row = cur.fetchall()
            cnx.commit()
        cur.close()
        cnx.close()
        return row

    def createTables(self, purge=False, data_path = 'flask_app/database/'):
        ''' FILL ME IN WITH CODE THAT CREATES YOUR DATABASE TABLES.'''

        #should be in order or creation - this matters if you are using forign keys.
         
        if purge:
            for table in self.tables[::-1]:
                self.query(f"""DROP TABLE IF EXISTS {table}""")
            
        # Execute all SQL queries in the /database/create_tables directory.
        for table in self.tables:
            
            #Create each table using the .sql file in /database/create_tables directory.
            with open(data_path + f"create_tables/{table}.sql") as read_file:
                create_statement = read_file.read()
            self.query(create_statement)

            # Import the initial data
            try:
                params = []
                with open(data_path + f"initial_data/{table}.csv") as read_file:
                    scsv = read_file.read()            
                for row in csv.reader(StringIO(scsv), delimiter=','):
                    params.append(row)
            
                # Insert the data
                cols = params[0]; params = params[1:] 
                self.insertRows(table = table,  columns = cols, parameters = params)
            except:
                #print('no initial data')
                pass

               

    def insertRows(self, table='table', columns=['x','y'], parameters=[['v11','v12'],['v21','v22']]):
        # Check if there are multiple rows present in the parameters
        has_multiple_rows = any(isinstance(el, list) for el in parameters)
        keys, values      = ','.join(columns), ','.join(['%s' for x in columns])
        
        # Construct the query we will execute to insert the row(s)
        query = f"""INSERT IGNORE INTO {table} ({keys}) VALUES """
        if has_multiple_rows:
            for p in parameters:
                query += f"""({values}),"""
            query     = query[:-1] 
            parameters = list(itertools.chain(*parameters))
        else:
            query += f"""({values}) """                      
        
        insert_id = self.query(query,parameters)[0]['LAST_INSERT_ID()']         
        return insert_id
    
    def getLeaderboard(self):
        query = "SELECT gameusers.username as User, MIN(leaderboard.time) AS best_time FROM leaderboard JOIN gameusers ON leaderboard.username = gameusers.username GROUP BY leaderboard.username ORDER BY best_time ASC LIMIT 5"
        leaderboard_results = self.query(query)
        return leaderboard_results
    

    def get_new_word_from_file(self):
        with open('flask_app/words.txt', 'r') as file:
            words = file.read().splitlines()
        return random.choice(words)

    def update_daily_word(self):
        new_word = self.get_new_word_from_file()
        self.query("UPDATE daily_word SET word = %s", [new_word])
    
    def select_daily_word(self):
        query = "SELECT word FROM daily_word"
        word = self.query(query)
        #print("SELECT", word)   
        return word


    def getResumeData(self):
        # Pulls data from the database to genereate data like this:
        #pass
        #print("In getResumeData NOW:")
        institutionsData = self.query("SELECT * FROM institutions;")
        positionsData = self.query("SELECT * FROM positions;")
        experiencesData = self.query("SELECT * FROM experiences;")
        skillsData = self.query("SELECT * FROM skills;")
        #print("institutionsData: ",institutionsData)
        #print("positionsData: ",positionsData)
        #print("experiencesData: ",experiencesData)
        #print("skillsData: ",skillsData)
        final_dictionary = {}

        #starting institution
        for inst_dict in institutionsData:
            inst_id = inst_dict["inst_id"]
            del inst_dict["inst_id"]
            inst_dict["positions"] = {}
            final_dictionary[inst_id] = inst_dict
        

        #
        # starting position
        for pos_dict in positionsData:
            pos_id = pos_dict["position_id"]
            inst_id = pos_dict["inst_id"]
            del pos_dict["position_id"]
            del pos_dict["inst_id"]
            #print(inst_id,pos_id)
            pos_dict["experiences"] = {}
            final_dictionary[inst_id]["positions"][pos_id] = pos_dict

        exp_inst_id = None
        for exp_dict in experiencesData:
            exp_id = exp_dict["experience_id"]
            pos_id = exp_dict["position_id"]
            
            del exp_dict["experience_id"]
            del exp_dict["position_id"]

            for inst_id, inst in final_dictionary.items():
                pos_dict = inst["positions"]
                if pos_id in pos_dict:
                    exp_inst_id = inst_id
                    break
            exp_dict["skills"] = {}
            final_dictionary[exp_inst_id]["positions"][pos_id]["experiences"][exp_id] = exp_dict

        skill_pos_id = None
        skill_inst_id = None
        for skill_dict in skillsData:
            skill_id = skill_dict["skill_id"]
            exp_id = skill_dict["experience_id"]
            #print(skill_id,exp_id)
            del skill_dict["skill_id"]
            del skill_dict["experience_id"]

            for inst_id, inst in final_dictionary.items():
                for pos_id, pos_dict in inst["positions"].items():
                    exp_dict = pos_dict["experiences"]
                    if exp_id in exp_dict:
                        skill_pos_id = pos_id
                        skill_inst_id = inst_id
                        break
            final_dictionary[skill_inst_id]["positions"][skill_pos_id]["experiences"][exp_id]["skills"][skill_id] = skill_dict
           
            
            
        
        #print("final_dictionary: ", final_dictionary)
        return final_dictionary
    

    def getFeedbackData(self):
        feedbackData = self.query("SELECT * FROM feedback;")
        final_dictionary = {} 
        for feed_dict in feedbackData:
            comment_id = feed_dict['comment_id']
            del feed_dict['comment_id']
            final_dictionary[comment_id] = feed_dict    
        return final_dictionary


#######################################################################################
# AUTHENTICATION RELATED
#######################################################################################
    def createUser(self, email='me@email.com', password='password', role='user'):
        '''Contains code to create database entried for your users.'''

        userexists = self.query("SELECT * FROM users WHERE email =%s",[email])
        if userexists:
            return {'success': 0, 'message': 'User already exists'}
        scryptpassword = self.onewayEncrypt(password)
        self.insertRows('users',['role','email','password'],[['guest',email,scryptpassword]])
        userexists = self.query("SELECT * FROM users WHERE email =%s",[email])
        return {'success': 1, 'user_id': userexists[0]['user_id'], 'email':email}
    

    def createGameUser(self, username='me', password='Password1', role='guest'):
        '''Contains code to create database entried for your gameusers.'''

        userexists = self.query("SELECT * FROM gameusers WHERE username =%s",[username])
        if userexists:
            return {'success': 0, 'message': 'User already exists'}
        scryptpassword = self.onewayEncrypt(password)
        self.insertRows('gameusers',['role','username','password'],[['guest',username,scryptpassword]])
        userexists = self.query("SELECT * FROM gameusers WHERE username =%s",[username])
        return {'success': 1, 'user_id': userexists[0]['user_id'], 'username':username}


    def authenticate(self, email='me@email.com', password='password'):
        '''Contains code to check if a given username and password combination exist in the database.'''
        user = self.query("SELECT * FROM users WHERE email =%s",[email])
        if not user:
            return {'success': 0, 'message': 'User not found'}
        
        dbpassword = user[0]['password']
        encryptpassword = self.onewayEncrypt(password)
        if dbpassword == encryptpassword:
            return {'success': 1, 'user_id': user[0]['user_id'], 'email':email}
        else:
            return {'success' : 0, 'message': 'Incorrect password'}
        

        
    def gameAuthenticate(self, username='me', password='password'):
        '''Contains code to check if a given username and password combination exist in the database.'''
        user = self.query("SELECT * FROM gameusers WHERE username =%s",[username])
        if not user:
            return {'success': 0, 'message': 'User not found'}
        
        dbpassword = user[0]['password']
        encryptpassword = self.onewayEncrypt(password)
        if dbpassword == encryptpassword:
            return {'success': 1, 'user_id': user[0]['user_id'], 'username':username}
        else:
            return {'success' : 0, 'message': 'Incorrect password'}
        

    
    def authenticateLeaderboard(self, username='me'):
        '''Contains code to check if a given username exists in the database.'''
        user = self.query("SELECT * FROM leaderboard WHERE username =%s",[username])
        if user:
            return {'success': 1, 'message': 'Place user in leaderboard'}
        else:
            return {"success": 0, 'message': "User has won already"}
        


    
    


    def onewayEncrypt(self, string):
        '''Contains code for irriversible encryption of passwords stored in the database.'''
        encrypted_string = hashlib.scrypt(string.encode('utf-8'),
                                          salt = self.encryption['oneway']['salt'],
                                          n    = self.encryption['oneway']['n'],
                                          r    = self.encryption['oneway']['r'],
                                          p    = self.encryption['oneway']['p']
                                          ).hex()
        return encrypted_string


    def reversibleEncrypt(self, type, message):
        '''Contains code for reversible encryption of content that will be stored in sessions.'''
        fernet = Fernet(self.encryption['reversible']['key'])
        
        if type == 'encrypt':
            message = fernet.encrypt(message.encode())
        elif type == 'decrypt':
            message = fernet.decrypt(message).decode()

        return message


