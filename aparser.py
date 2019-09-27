import csv
import requests
import xml.etree.ElementTree as ET
from pymongo import MongoClient
import pprint
from faker import Faker

fake = Faker()

client = MongoClient('mongodb://:@:27017/biditdb')
db = client['biditdb']

Auctions = db.Auctions
Users = db.Users
Bids = db.Bids
files = []
for i in range(0,40):
    files.append("./items-"+ str(i)+".xml")
print(files)

for file in files:
    print("*****open "+file+"*****")
    xmlfile = open(file,'r')

    # create element tree object
    tree = ET.parse(xmlfile)

    # get root element
    root = tree.getroot()

    # iterate auction items
    no = 1
    for item in root.findall('./Item'):

        auction = {}
        bids = []
        print("item number: " + str(no))
        no += 1

        for bid in item.findall('./Bids/Bid'):
            bid_info = {}
            for child in bid:
                if child.tag == 'Bidder':
                    bidderRating = child.attrib['Rating']
                    username = child.attrib['UserID']
                    location = ""
                    country = ""
                    for c in child:
                        if c.tag == 'Location':
                            location = c.text
                        else:
                            country = c.text
                    user = Users.find_one({'username': username})
                    if not user:
                        new_user = {
                            'username': username,
                            'first_name': fake.first_name(),
                            'last_name': fake.last_name(),
                            'email': fake.email(),
                            'password': '$2a$10$4LXsrumC2JrkvZm/cO6dWuHxLvzIy2mh0iTOu9fRHZwtWFw4IORWe', #okokokok
                            'phone': fake.phone_number(),
                            'address': {
                                'street': fake.street_address(),
                                'city': location,
                                'country': country,
                                'zipcode': fake.zipcode(),
                                'longtitude': 0,
                                'latitude': 0,
                            },
                            'afm': 0,
                            'bidderRating': bidderRating,
                            'sellerRating': 0,
                            'admin': False,
                            'approved': True,
                            'chats': []
                        }
                        user = Users.insert_one(new_user)
                        bid_info['bidder_id'] = user.inserted_id
                    else:
                        bid_info['bidder_id'] = user['_id']
                if child.tag == 'Amount':
                    string = child.text.replace(',', '')
                    bid_info['amount'] = float(string[1:])
                if child.tag == 'Time':
                    bid_info['time'] = child.text
            # print(bid_info)
            bids.append(bid_info)


        categories = []
        # print()
        for child in item:

            if child.tag == 'Name':
                auction['name'] = child.text
            elif child.tag == 'Currently':
                string = child.text.replace(',', '')
                auction['currently'] = float(string[1:])
            elif child.tag == 'Buy_Price':
                string = child.text.replace(',', '')
                auction['buy_price'] = float(string[1:])
            elif child.tag == 'First_Bid':
                string = child.text.replace(',', '')
                auction['first_bid'] = float(string[1:])
            elif child.tag == 'Number_of_Bids':
                auction['number_of_bids'] = int(child.text)
            elif child.tag == 'Location':
                location = {}
                location['name'] = child.text
                if child.attrib:
                    location['latitude'] = child.attrib['Latitude']
                    location['longtitude'] = child.attrib['Longitude']
                auction['location'] = location
            elif child.tag == 'Country':
                auction['country'] = child.text
            elif child.tag == 'Started':
                auction['startingDate'] = child.text
            elif child.tag == 'Ends':
                auction['endingDate'] = child.text
            elif child.tag == 'Description':
                auction['description'] = child.text
            elif child.tag == 'Seller':
                auction['seller_display'] = child.attrib['UserID']
            elif child.tag == 'Category':
                categories.append(child.text)

        auction['categories'] = categories
        auction['photos'] = []
        auction['bids'] = []
        auction['started'] = True
        auction['bought'] = False
        auction['visits'] = 0

        ret_auction = Auctions.insert_one(auction)
        bids_ids = []
        for bid in bids:
            bid['auction_id'] = ret_auction.inserted_id
            ret_bid = Bids.insert_one(bid)
            bids_ids.append(ret_bid.inserted_id)
        upd_auction = Auctions.find_one_and_update({'_id': ret_auction.inserted_id}, { '$set' : {'bids': bids_ids} })
