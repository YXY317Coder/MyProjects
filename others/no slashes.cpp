/*
#include <bits/stdc++.h>
using namespace std;
string f;
int stacked = 0;

int main(){
    freopen("login.js","r",stdin);
    freopen("main.js","w",stdout);
    while (getline(cin,f)){
    	if (f == ""){
			continue;
		}
        for (int i = 0;i < f.size() - 1;i++){
            if (stacked == 0){
                if (f[i] == '/' && f[i + 1] == '/'){
                    stacked = 1;
                }
                else if (f[i] == '/' && f[i + 1] == '*'){
                    stacked = 2;
                }
                else{
                    cout << f[i];
                }
            }
            else{
                if (f[i] == '*' && f[i + 1] == '/' && stacked == 2){
                    stacked = 0;
                    i++;
                }
            }
        }
        if (stacked == 1){
            stacked = 0;
        }
        cout << endl;
    }
    return 0;
}
*/

#include <bits/stdc++.h>
using namespace std;
string f;
int stacked = 0;

string trim(const string& str) {
    if (str.empty()) return str;
    size_t start = str.find_first_not_of(" \t\n\r\f\v");
    size_t end = str.find_last_not_of(" \t\n\r\f\v");
    if (start == string::npos) return "";
    return str.substr(start, end - start + 1);
}

int main() {
	ios::sync_with_stdio(false);
	cin.tie(nullptr);
	cout.tie(nullptr);
	setlocale(LC_ALL, "UTF-8");
	freopen("login.js", "r", stdin);
	freopen("main.js", "w", stdout);
	while (getline(cin, f)) {
		if (trim(f) == "") {
			continue;
		}
		for (int i = 0; i < static_cast<int>(f.size()) - 1; i++) {
			if (stacked == 0) {
				if (f[i] == '/' && f[i + 1] == '/') {
					stacked = 1;
					i++;
				} else if (f[i] == '/' && f[i + 1] == '*') {
					stacked = 2;
					i++;
				} else {
					cout << f[i];
				}
			} else {
				if (f[i] == '*' && f[i + 1] == '/' && stacked == 2) {
					stacked = 0;
					i++;
				}
			}
		}
		if (stacked == 1) {
			stacked = 0;
		}
		if (stacked == 0) {
			cout << '\n';
		}
	}
	return 0;
}
