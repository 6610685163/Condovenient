import 'package:flutter/material.dart';

class ParcelScreen extends StatefulWidget {
  const ParcelScreen({super.key});

  @override
  State<ParcelScreen> createState() => _ParcelScreenState();
}

class _ParcelScreenState extends State<ParcelScreen> {
  // จำลองสถานะตู้ Locker (0 = ว่าง, 1 = มีพัสดุของ User, 2 = เต็ม/พัสดุคนอื่น)
  final List<int> _lockerStatus = [1, 0, 2, 0, 0, 1, 2, 0, 0, 2, 0, 0];

  void _showPickupQRCode(int lockerNumber) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Center(child: Text('Scan to Open Locker #$lockerNumber')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'กรุณานำ QR Code นี้ไปสแกนที่ตู้ Locker',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 20),
            // จำลอง QR Code
            Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.black, width: 2),
                image: const DecorationImage(
                  image: NetworkImage(
                    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Locker1234',
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Exp: 10:00 mins',
              style: TextStyle(
                color: Colors.red[400],
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text(
          'Parcel & Locker',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- ส่วนสถานะ Locker ---
            const Text(
              'Smart Locker Status',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
              ),
              itemCount: _lockerStatus.length,
              itemBuilder: (context, index) {
                Color bgColor = Colors.white;
                IconData? icon;
                Color iconColor = Colors.grey;

                if (_lockerStatus[index] == 1) {
                  bgColor = Colors.blue[50]!;
                  icon = Icons.inventory_2;
                  iconColor = Colors.blue;
                } else if (_lockerStatus[index] == 2) {
                  bgColor = Colors.grey[200]!;
                  icon = Icons.lock_outline;
                }

                return GestureDetector(
                  onTap: _lockerStatus[index] == 1
                      ? () => _showPickupQRCode(index + 1)
                      : null,
                  child: Container(
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _lockerStatus[index] == 1
                            ? Colors.blue
                            : Colors.transparent,
                      ),
                    ),
                    child: Center(
                      child: icon != null
                          ? Icon(icon, color: iconColor)
                          : Text(
                              '${index + 1}',
                              style: const TextStyle(color: Colors.grey),
                            ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 32),

            // --- ส่วนรายการพัสดุที่รอรับ ---
            const Text(
              'พัสดุรอรับ (Active Parcels)',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildParcelItem('Kerry Express', 'Locker #1', 'Arrived: 09:30 AM'),
            _buildParcelItem('Flash Home', 'Locker #6', 'Arrived: Yesterday'),
          ],
        ),
      ),
    );
  }

  Widget _buildParcelItem(String carrier, String location, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.blue[100],
            child: const Icon(Icons.local_shipping, color: Colors.blue),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  carrier,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  location,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () =>
                _showPickupQRCode(int.parse(location.split('#')[1])),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Get QR',
              style: TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
