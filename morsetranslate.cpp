#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
	
  const char letters[37] = { ' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' };
  const string morseLetters[37] = { "    ", ". ___", "___ . . .", "___ . ___ .", "___ . .", ".", ". . ___ .", "___ ___ .", ". . . .", ". .", ". ___ ___ ___", "___ . ___", ". ___ . .",  "___ ___", "___ .", "___ ___ ___", ". ___ ___ .", "___ ___ . ___", ". ___ .", ". . .", "_", ". . ___", ". . . ___", ". ___ ___", "___ . . ___", "___ . ___ ___", "___ ___ . .", ". ___ ___ ___ ___", ". . ___ ___ ___", ". . . ___ ___", ". . . . ___", ". . . . .", "___ . . . .", "___ ___ . . .", "___ ___ ___ . .", "___ ___ ___ ___ .", "___ ___ ___ ___ ___"};
  string textToChange = "";
  string newText = "";
  cout << "Enter text you want to change to Morse code" << endl;
  getline(cin, textToChange);
  transform(textToChange.begin(), textToChange.end(), textToChange.begin(), ::tolower);
  
  for (unsigned int i = 0; i < textToChange.size(); i++) {
    for (unsigned short j = 0; j < 37; j++) {
      if (textToChange[i] == letters[j]) {
        newText += morseLetters[j];
        newText += "   ";
        break;
      }    
    }
  }
  
  cout << "Text in Morse code" << endl << newText;
  int a;
  cin >> a;
  return 0;
}
