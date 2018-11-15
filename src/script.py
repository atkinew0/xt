

fObj = open("commands.txt","r+")
fObj2 = open("commands2.txt","w")
lines = fObj.readlines()

for line in lines:
    line = line.rstrip()
    if line.isalnum:
        newLine = "\"" + line + "\"" + ":" +"\""+ line + "\",\n"
        print (newLine)
        fObj2.write(newLine)



