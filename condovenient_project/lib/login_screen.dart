import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  final String backendUrl = 'http://10.0.2.2:3000';

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _roomController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _roomController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _processLoginResponse(http.Response response, String provider) {
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success']) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$provider Login สำเร็จ: ${data['user']['name']}'),
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => HomeScreen(
              userName: data['user']['name'] ?? 'User',
              userRole: data['user']['role'] ?? 'Resident',
              userId: data['user']['id'] ?? '',
              roomNumber: data['user']['roomNumber'] ?? '',
            ),
          ),
        );
      }
    } else {
      _showError(data['message'] ?? 'เข้าสู่ระบบไม่สำเร็จ');
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  void _handleLogin() async {
    if (_roomController.text.isEmpty || _passwordController.text.isEmpty) {
      _showError('กรุณากรอกเลขห้องและรหัสผ่าน');
      return;
    }
    setState(() => _isLoading = true);
    try {
      final response = await http.post(
        Uri.parse('${widget.backendUrl}/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': _roomController.text.trim(),
          'password': _passwordController.text,
        }),
      );
      _processLoginResponse(response, 'Password');
    } catch (e) {
      _showError('ไม่สามารถเชื่อมต่อ Server ได้: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleGoogleLogin() async {
    setState(() => _isLoading = true);
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        setState(() => _isLoading = false);
        return;
      }
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      final UserCredential userCredential = await FirebaseAuth.instance
          .signInWithCredential(credential);
      final String? idToken = await userCredential.user?.getIdToken();

      if (idToken != null) {
        final response = await http.post(
          Uri.parse('${widget.backendUrl}/api/auth/google-login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'token': idToken}),
        );
        _processLoginResponse(response, 'Google');
      }
    } catch (e) {
      _showError('Google Login Error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleFacebookLogin() async {
    setState(() => _isLoading = true);
    try {
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['public_profile', 'email'],
      );
      if (result.status == LoginStatus.success) {
        final AuthCredential credential = FacebookAuthProvider.credential(
          result.accessToken!.tokenString,
        );
        final UserCredential userCredential = await FirebaseAuth.instance
            .signInWithCredential(credential);
        final String? idToken = await userCredential.user?.getIdToken();

        if (idToken != null) {
          final response = await http.post(
            Uri.parse('${widget.backendUrl}/api/auth/facebook-login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'token': idToken}),
          );
          _processLoginResponse(response, 'Facebook');
        }
      } else {
        _showError('ยกเลิก Facebook Login: ${result.message}');
      }
    } catch (e) {
      _showError('Facebook Error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.amber.withOpacity(0.1),
                ),
                child: const Icon(
                  Icons.home_work_outlined,
                  size: 64,
                  color: Colors.amber,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Condovenient',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.amber,
                  letterSpacing: 0.5,
                ),
              ),
              Text(
                'Smart Living, Simplified.',
                style: TextStyle(fontSize: 16, color: Colors.grey[400]),
              ),
              const SizedBox(height: 48),

              Card(
                color: const Color(0xFF1E1E1E),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: const BorderSide(color: Color(0xFF2A2A2A)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _roomController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: 'Room Number / Phone',
                          labelStyle: TextStyle(color: Colors.grey[400]),
                          prefixIcon: const Icon(
                            Icons.meeting_room_outlined,
                            color: Colors.amber,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFF333333),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Colors.amber,
                              width: 1.5,
                            ),
                          ),
                          filled: true,
                          fillColor: const Color(0xFF121212),
                        ),
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: 'Password',
                          labelStyle: TextStyle(color: Colors.grey[400]),
                          prefixIcon: const Icon(
                            Icons.lock_outline,
                            color: Colors.amber,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFF333333),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Colors.amber,
                              width: 1.5,
                            ),
                          ),
                          filled: true,
                          fillColor: const Color(0xFF121212),
                        ),
                      ),
                      const SizedBox(height: 32),

                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.amber,
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: _isLoading
                              ? const CircularProgressIndicator(
                                  color: Colors.black,
                                )
                              : const Text(
                                  'Sign In',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(child: Divider(color: Colors.grey[800])),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: Text(
                              'หรือ',
                              style: TextStyle(color: Colors.grey[500]),
                            ),
                          ),
                          Expanded(child: Divider(color: Colors.grey[800])),
                        ],
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: OutlinedButton(
                          onPressed: _isLoading ? null : _handleGoogleLogin,
                          style: OutlinedButton.styleFrom(
                            backgroundColor: const Color(0xFF121212),
                            side: const BorderSide(color: Color(0xFF333333)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.network(
                                'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
                                height: 24,
                                width: 24,
                                errorBuilder: (context, error, stackTrace) =>
                                    const Icon(
                                      Icons.g_mobiledata,
                                      size: 32,
                                      color: Colors.amber,
                                    ),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'เข้าสู่ระบบด้วย Google',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton.icon(
                          onPressed: _isLoading ? null : _handleFacebookLogin,
                          icon: const Icon(Icons.facebook, color: Colors.white),
                          label: const Text(
                            'เข้าสู่ระบบด้วย Facebook',
                            style: TextStyle(fontSize: 16, color: Colors.white),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1877F2),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              TextButton(
                onPressed: () {},
                child: const Text(
                  'Forgot Password? / Contact Support',
                  style: TextStyle(
                    color: Colors.amber,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
