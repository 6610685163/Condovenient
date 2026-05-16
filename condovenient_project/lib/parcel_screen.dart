import 'package:flutter/material.dart';

class ParcelScreen extends StatefulWidget {
  const ParcelScreen({super.key});

  @override
  State<ParcelScreen> createState() => _ParcelScreenState();
}

class _ParcelScreenState extends State<ParcelScreen> {
  final List<int> _lockerStatus = [1, 0, 2, 0, 0, 1, 2, 0, 0, 2, 0, 0];

  void _showPickupQRCode(int lockerNumber) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF2A2A2A)),
        ),
        title: Center(
          child: Text(
            'Locker #$lockerNumber QR',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'สแกน QR Code นี้ที่ตู้เพื่อเปิดรับพัสดุ',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 20),
            Container(
              width: 200,
              height: 200,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Image.network(
                'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Locker1234',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Exp: 10:00 mins',
              style: TextStyle(
                color: Colors.redAccent,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('ปิด', style: TextStyle(color: Colors.amber)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text(
          'Parcel & Locker',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: const Color(0xFF1E1E1E),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Smart Locker Status',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
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
                Color bgColor = const Color(0xFF1E1E1E);
                IconData? icon;
                Color iconColor = Colors.grey;
                BoxBorder? border = Border.all(color: const Color(0xFF2A2A2A));

                if (_lockerStatus[index] == 1) {
                  bgColor = Colors.amber.withOpacity(0.15);
                  icon = Icons.inventory_2_rounded;
                  iconColor = Colors.amber;
                  border = Border.all(color: Colors.amber, width: 1.5);
                } else if (_lockerStatus[index] == 2) {
                  bgColor = const Color(0xFF2A2A2A);
                  icon = Icons.lock_outline_rounded;
                  iconColor = Colors.grey[600]!;
                }

                return GestureDetector(
                  onTap: _lockerStatus[index] == 1
                      ? () => _showPickupQRCode(index + 1)
                      : null,
                  child: Container(
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(12),
                      border: border,
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

            const Text(
              'พัสดุรอรับ (Active Parcels)',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2A2A)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.amber.withOpacity(0.1),
            child: const Icon(
              Icons.local_shipping_rounded,
              color: Colors.amber,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  carrier,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  location,
                  style: const TextStyle(
                    color: Colors.amber,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () =>
                _showPickupQRCode(int.parse(location.split('#')[1])),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Get QR',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
