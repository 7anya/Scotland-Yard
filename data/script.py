
file1 = open('Map-Input.txt', 'r')
Lines = file1.readlines()
map={}

for line in Lines:
    row=line.strip().split()
    map[row[0]]=[] 
for line in Lines:
    row=line.strip().split()
    map[row[0]].append({row[1]:row[2]})
import json
print(json.dumps(map))