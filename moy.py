#!/usr/bin/python3

import csv

def tf(a):
    if(a != ''):
        return float(a)
    return 0


tout = {}


with open('nf1980.csv', 'r') as csvfile:
    datas = csv.reader(csvfile, delimiter=',', quotechar='|')
    for a in datas:
        year = a[0]
        temp = tf(a[1])
        state = a[2] 
        if not (state in tout):
            tout[state] = {}
        if not (year in tout[state]):
            tout[state][year] = {'somme' : temp, 'n' : 1}
        else:
            tout[state][year]['somme'] += temp
            tout[state][year]['n'] += 1


for state in tout:
    for year in tout[state]:
        avg = tout[state][year]['somme'] / tout[state][year]['n']
        tout[state][year]['avg'] = avg
        print(state + " " + str(avg))

with open('new_dataset.csv', 'w') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)
    for state in tout:
        for year in tout[state]:
            avg = tout[state][year]['avg']
            spamwriter.writerow([year,avg,state])
