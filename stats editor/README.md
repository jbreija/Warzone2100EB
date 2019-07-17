# Warzone2100 Stats Editor

![alt text](https://github.com/jbreija/Warzone2100EB/blob/master/stats%20editor/stats%20editor.png)

The stats editor allows editing and exporting the Warzone 2100 stats .json files into Excel

This is very advantageous for sorting, filtering, slicing, searching, modifying and grouping stats based on their attributes. 


I used an online utility to import the Warzone 2100 .json files into Excel and from there I wrote a .json serializer in VBA to export the .json. Then I added some pretty formatting to make it look nice.

I imported two copies of the Warzone 2100 .json stat files in Excel. 
One copy is used for editing and the other is used as a reference to the original stats. I then used conditional formatting to compare the two copies and implemented a diff like feature. 

All numerical values were diff'ed so that green would indicate a "buff" or better and red would refer to "nerf" or worse. Sometimes higher values are better (damage) and sometimes their worse (weight).
Over the years, after inserting many rows and columns the conditional formatting rules were sliced and diced many times and now it's just a mess in some areas. The color formatting is harmless and feel free to set your own.

The first column in every sheet is used to preserve order for exporting to .json. If you want to add a new row, you have to add a new number and increment all other rows after or use decimal places.


![alt text](https://github.com/jbreija/Warzone2100EB/blob/master/stats%20editor/stats%20editor%204.png)
![alt text](https://github.com/jbreija/Warzone2100EB/blob/master/stats%20editor/stats%20editor2.png)
![alt text](https://github.com/jbreija/Warzone2100EB/blob/master/stats%20editor/stats%20editor3.png)
