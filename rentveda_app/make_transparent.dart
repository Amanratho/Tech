import 'dart:io';
import 'dart:convert';
void main() {
  File('assets/images/transparent.png').writeAsBytesSync(base64Decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='));
}
