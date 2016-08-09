#!/usr/local/bin/python

import os

def main():
    print('os.path.abspath(__file__)')
    dir_path = os.path.dirname(os.path.realpath(__file__))
   
    print(dir_path)
    
    concat = ""
    
    files = ['musedata.dev.js','exampledata.js','socket.io-1.4.5.js']
    saveFile = 'musedata.js'
    
    for f in files:
        path = dir_path + '/' + f
        with open(path, 'r') as file:
            content = file.read()
            concat = concat + '\n\n'
            concat = concat + '//' + f
            concat = concat + '\n' + content
    
    print(concat)
    
    savePath = dir_path + '/' + saveFile
    with open(savePath, 'w') as outfile:
         outfile.write(concat)
    

if __name__ == '__main__':
    main()

