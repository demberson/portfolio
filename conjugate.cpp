//This is a basic program made as a proof of concept to make my mom happy

#include <iostream>
#include <string>
using namespace std;

void ConjugateAr(string verb)
{
	string verbYo = verb;
	string verbTu = verb;
	string verbUsted = verb;
	string verbUstedes = verb;
	string verbNosotros = verb;
	
	cout << "yo " << verbYo.replace(verbYo.end()-2,verbYo.begin(),"o") << endl;
	cout << "tu " << verbTu.replace(verbTu.end()-2,verbTu.begin(),"as") << endl;
	cout << "usted " << verbUsted.replace(verbUsted.end()-2,verbUsted.begin(),"a") << endl;
	cout << "ustedes " << verbUstedes.replace(verbUstedes.end()-2,verbUstedes.begin(),"an") << endl;
	cout << "nosotros " << verbNosotros.replace(verbNosotros.end()-2,verbNosotros.begin(),"amos") << endl;
}

void ConjugateEr(string verb)
{
	string verbYo = verb;
	string verbTu = verb;
	string verbUsted = verb;
	string verbUstedes = verb;
	string verbNosotros = verb;
	
	cout << "yo " << verbYo.replace(verbYo.end()-2,verbYo.begin(),"o") << endl;
	cout << "tu " << verbTu.replace(verbTu.end()-2,verbTu.begin(),"es") << endl;
	cout << "usted " << verbUsted.replace(verbUsted.end()-2,verbUsted.begin(),"e") << endl;
	cout << "ustedes " << verbUstedes.replace(verbUstedes.end()-2,verbUstedes.begin(),"en") << endl;
	cout << "nosotros " << verbNosotros.replace(verbNosotros.end()-2,verbNosotros.begin(),"emos") << endl;
}

int main()
{
	string verb;
	int choice;
	while (choice != 3) {
	
		cout << "Choose which type of verb you wish to conjugate to present tense:" << endl << "Type '1' for -ar verbs" << endl;
		cout << "Type '2' for -er verbs" << endl;
		cout << "Type '3' to quit" << endl << endl;
		cin >> choice;
		cout << endl;
		
		if(choice == 1) {
			cout << "Enter a spanish verb (-ar): ";
			cin >> verb;
			ConjugateAr(verb);
			cout << endl << endl;
		}
		
		if(choice == 2) {
			cout << "Enter a spanish verb (-er): ";
			cin >> verb;
			ConjugateEr(verb);
			cout << endl << endl;
		}
		
		if(choice > 3 || choice < 1) {
			cout << "Choice must be a number listed";
		}
	
	}
}

