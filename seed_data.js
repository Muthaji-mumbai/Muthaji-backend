const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Category = require('./model/categoryModel');
const User = require('./model/userModel');

const categoriesData = [
  {
    "_id": "68c26d9af41c2be4ba0fb860",
    "categoryname": "Bracelet (Kada)",
    "size": ["2", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "Other", "Regular"],
    "unit": ["Aani"]
  },
  {
    "_id": "68c27372606fd701ba52003d",
    "categoryname": "Bangle",
    "size": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10", "Other"],
    "unit": ["Aani"]
  },
  {
    "_id": "68c33ba89968c260814a76f5",
    "categoryname": "Ring",
    "size": ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "Others", "Regular"],
    "unit": ["Oscar", "Pn Budh"]
  },
  {
    "_id": "68c8253711544136c09b4f4f",
    "categoryname": "Loose Bracelet",
    "size": ["6", "6.5", "7", "7.5", "Regular", "Others"],
    "unit": ["Inches"]
  },
  {
    "_id": "68ece92c4d47bc2581e64c30",
    "categoryname": "Tops",
    "size": ["Round Tops", "J Tops", "Bali"],
    "unit": ["Bombay", "South", "Others"]
  },
  {
    "_id": "68fc691df7f6e0fe1d1f5ac4",
    "categoryname": "Necklace",
    "size": ["With Chain", "Without Chain"],
    "unit": ["Full Set", "Only Necklace", "Only Tops"]
  },
  {
    "_id": "6900dc50f3dfd77c1d664d5d",
    "categoryname": "Pendant",
    "size": ["With Chain", "Without Chain"],
    "unit": ["With earrings", "Without earrings"]
  },
  {
    "_id": "69033a34ebc33e466defbb95",
    "categoryname": "Pendant Set",
    "size": ["With Chain", "Without Chain"],
    "unit": ["Full set", "Only Pendant", "Only Tops"]
  },
  {
    "_id": "69033d0febc33e466defbba5",
    "categoryname": "Ms Set",
    "size": ["15Inch", "16Inch", "17Inch", "Without Chain", "Others"],
    "unit": ["Full Set", "Only Ms", "Only Tops"]
  },
  {
    "_id": "698c1b83879f4dcb30b62b2d",
    "categoryname": "Others",
    "size": ["Others"],
    "unit": ["Others"]
  },
  {
    "_id": "69bbca113dfe418a548e28e3",
    "categoryname": "Gents Ring",
    "size": ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "Others", "Regular"],
    "unit": ["Pnbudh", "Oscar"]
  }
];

const usersData = [
  {
    "_id": "68c1bf84f63570a40386e3df",
    "name": "Admin",
    "email": "mehtaneel21@gmail.com",
    "phone": "1234567890",
    "role": "admin",
    "address": "Mumbai",
    "fcmtoken": "cfF-gpq4R5OUSBXPPCXXcP:APA91bFV4hEJnVbOFuivGLTrTVAGQwOjpeAHxd-CPkogenURV4dfVZVrJTTM530RI5RBsVWth1IJm239KX3RREAdsCfPg9QMsGygDPwbDlXnpWvncJQ8oVE"
  },
  {
    "_id": "68c1bfd8f63570a40386e3f1",
    "name": "mehtadivya",
    "email": "mehtadivya67@gmail.com",
    "phone": "1234567890",
    "role": "admin",
    "address": "Mumbai",
    "fcmtoken": "fCEl0t9UTV6tt9hv0ZgG0J:APA91bH38cZwmCnJmagjFec28xKofdY-wONMmF9nufr7od1sjCpHQhN0nCL7isVCyFeTjrojXMh2W-xEjxpVg4kKYgMWmSzGv-P0ITr8roSfAuDu3xmsgO8"
  },
  {
    "_id": "68c26bbaf41c2be4ba0fb857",
    "name": "Arun",
    "email": "arun.client@gmail.com",
    "phone": "7356626832",
    "role": "customer",
    "address": "Pune",
    "fcmtoken": "fiqVkMiUTM-Lq3bEhFPobs:APA91bEEf1aNGfOViqnuLguYpzQnUlh3pBHKhktsa8Zc7ALiZ6bdsf-_gD8JV0jQuoJIWO8UxqZyGnL4sqboZXD0rpoLW2ou1meoSVhhjil8ZvAkl43VcZk"
  },
  {
    "_id": "68c5092c56bb7038dbf1d57e",
    "name": "Dinesh",
    "email": "muthajigold@gmail.com",
    "phone": "9920461699",
    "role": "admin",
    "address": "Mumbai",
    "fcmtoken": "fkttIwJoRu22N8a39tuFwl:APA91bHbBfNi30adlb1LsFESDQ1_oiCoTodXlYtcMKg2PcPbCVOW8i_RMcF5bKTqzUIYIXG4Qr2FJ2gEtBZNdIZ06JQ_qHksi_p0vjapOxmSVDkJTbNVIl8"
  },
  {
    "_id": "68c51f835aca8b24aa2c3b6d",
    "name": "Dinesh",
    "email": "ordersmuthajigold@gmail.com",
    "phone": "8291605161",
    "role": "customer",
    "address": "xyz",
    "fcmtoken": ""
  },
  {
    "_id": "68c84b7b8d98605e9ba1be25",
    "name": "Tablet",
    "email": "mehtaneel23@gmail.com",
    "phone": "845",
    "role": "employee",
    "address": "ff",
    "fcmtoken": "fkttIwJoRu22N8a39tuFwl:APA91bFcDcipUnkJjb0a3Fqtdvf0JVqBt5jOxtJQXs-gXtzl37TF0owfeAzwUc1QDeDWoJbAI37sEkgBIP2DyhLU2ZKzkKG2tLKQtRhyGaccyabRLwCYVYg"
  },
  {
    "_id": "68cbc22a6fe9e2ba25fcddd9",
    "name": "sreesh",
    "email": "s@gmail.com",
    "phone": "000000000",
    "role": "employee",
    "address": "thrissur",
    "fcmtoken": "eR-q1Sb4RmO0qyVBxUceBU:APA91bEgHn4b5exbpy9OUcN7eGly4tHRlpz6eD4-FDG7DG9DhfF5OnSX_z2uihcl_eNF6bcLcSflmesFj3bfNvcEmjJ9dTyHmdk8mfuKogy_3Ne-aoaP-oM"
  },
  {
    "_id": "68d98d8e2d6979d55857bba8",
    "name": "sree",
    "email": "sree@gmail.com",
    "phone": "8129690147",
    "role": "customer",
    "address": "kala",
    "fcmtoken": "dFBTRCO8TNuxKvuTQPCCBH:APA91bGgPAdZyaHZ-utXXmmctta9K_0c4BASeW0QWZp0ETISRXFR1QfhDPhp8U0YlHs8g2cDZ-ebUhQtZnojx0cW-7PsIubMF5bEuMNwIM4AlO3PysGn1bc"
  },
  {
    "_id": "693150447fbb18314615ad47",
    "name": "SS",
    "email": "ss@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "SS",
    "fcmtoken": "dgMuV8UqR3KIdte7Jw_sSG:APA91bF_OcFYYBU2TrwGED4eBYSbyZDD1oQhA5tZInEYRrKIEoPjCpgo-4ODwXnsfGuBWGpzzDRagDeEidLD9WsfCdEBgdgdMGI9CCe2Cq0fETdPZ1banMI"
  },
  {
    "_id": "693170207fbb18314615add5",
    "name": "GM",
    "email": "gm@muthaji.com",
    "phone": "987654321",
    "role": "customer",
    "address": "abc",
    "fcmtoken": "drseNhzGTJWM7EZzHdtDRg:APA91bFm4k4c02RBc6pzjvRF-o19gF5d7MHiH9NzQpE62y8ldbRRU1f_N_-PtJJfiIROTwCXERFqbTqmZ_TVSh83nhVupGSOZakhS52YI9PKHgJGvj1EKr4"
  },
  {
    "_id": "6931703e7fbb18314615add9",
    "name": "SRG",
    "email": "srg@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": "ch8KwLwYRKm2T3dC0MW2Xh:APA91bF3GsCQAlHHfdB73egp5wo-EHra1ZRKf_8Al6YR4W_8bNenYd2TOGpr53dABD0SoBQaxzR_SXz8eXySQgMweQ2fSHUPgYM2Sbd6M75ePbMfPm2TKrA"
  },
  {
    "_id": "6931709e7fbb18314615ade1",
    "name": "MD",
    "email": "md@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": "cOFUh3YyS62poNWs9twRho:APA91bEs2ua_q0MgwT5HF5q6HiiZWkEEe0Sn_6K3dS6VET8EGqAx5dpZAaVWOs_EhbnEe_AY53AWSZLeAlfWe6zA0b-FPUepP1eIV-ofVlyrr2QKR05ZwR8"
  },
  {
    "_id": "693170e17fbb18314615ade5",
    "name": "CH",
    "email": "ch@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": "ekoheWpfSH2I3XMSopF_ce:APA91bGUWEcHorQwyaxuhku-HWKOKGiJao39ouMw1TO5_5cVz1CxmAsNcjbLRIdgxHhJzUdMmUrBgwmZ0Wt1M2I_z_l7qKLQqzlciNczlykcpI8UQQuf_o0"
  },
  {
    "_id": "6931716a7fbb18314615adf1",
    "name": "ASJ",
    "email": "asj@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": ""
  },
  {
    "_id": "69394186958ee2352c09a7a5",
    "name": "Central",
    "email": "central@muthaji.com",
    "phone": "9876543210",
    "role": "employee",
    "address": "xyz",
    "fcmtoken": "cUwYsWPKSZaoANv3-kvy1C:APA91bFt25AqnglsH8hvr0qOUJQC6IPJo_tc00mnGlcPmOIGPn8XXgTjOiM1alpkfWbsUrchyop0WBULKLBIow6UFtM4xHdxpEOWIaPcPQIODv2LZNhNSmc"
  },
  {
    "_id": "693941aa958ee2352c09a7a9",
    "name": "Sales",
    "email": "sales@muthaji.com",
    "phone": "9876543210",
    "role": "employee",
    "address": "xyz",
    "fcmtoken": "eBMVPTK5Qx-37ZrHWLn8Ti:APA91bHzwISnglaPCSa5sTM9bfyaIjLfXvjZLF2ENKuQ3wBCIIrgeWL86lODtQKiOpKD-0njC9aYCcmlS6YVM43XvESD16dwOH9tEa5qAsLPXFx6zbXrAUE"
  },
  {
    "_id": "693d6e3f958ee2352c09d665",
    "name": "IRA",
    "email": "ira@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "Mumbai",
    "fcmtoken": "cfcloYpTT5uf72Vbrj8Hng:APA91bHvmffkPI6_Th9ovgSVLusy1RFfXxPA3-7fKoe3jTjfEVYJy3mrvvEsjVgo9YZEjqxKm8Lwjz2YmwyW6gcXUPIHMWJfjwgTQnQj-u55kBP4Df70CTo"
  },
  {
    "_id": "69450206a8e510d392c19321",
    "name": "MSD",
    "email": "msd@muthaji.com",
    "phone": "987654321",
    "role": "customer",
    "address": "abc",
    "fcmtoken": "eBb60DW5T5WI-vZk5kg-VF:APA91bFBQD_iNnZE02ncFp6e3TM1koY3Oltq_gWMHXEZwn9Y9rcQ4JLOU4-0CvNfmixr9GE-FM-j_TqX8iRm7ImzOPMI73Je8C2XqglbBFjkrDlsVNZVkR0"
  },
  {
    "_id": "6958e35da8e510d392c633c4",
    "name": "Manish Floor",
    "email": "floor@muthaji.com",
    "phone": "9876543218",
    "role": "employee",
    "address": "Mumbai",
    "fcmtoken": "d1D0FZgoTwW2j-Au6q2WyJ:APA91bExO1FOmNy6pjlqJFRgRZtVyQFO269eeSP2-mMnc6GwnuOHe7RooDJvAJn60CmvyVsChXzMOq5Ott7WtPNqgFW4G6POXDTUTV2aOLc91A_TGMDyTW8"
  },
  {
    "_id": "69649267a8e510d392c991a9",
    "name": "MM",
    "email": "mm@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "Mumbai",
    "fcmtoken": "f17J5BXfSRe9yU1PmpmpjK:APA91bF6QsGxQ7iUX25e-OMSc4efpMNW2kOaCrcjPt8bhh_2cb0tmzSgqwasfhHTOzUW1zsbZSnXe6AwH3HbhDvcPsb4P3TDfxO9FTa51pooto6POF3a9bw"
  },
  {
    "_id": "6968aac1a8e510d392cbf626",
    "name": "HJ",
    "email": "hj@muthaji.com",
    "phone": "9876543218",
    "role": "customer",
    "address": "Mumbai",
    "fcmtoken": "dbzGBaTKRCyDbtt9pdbHA7:APA91bFxWE57-BuEA4itdyQa__KTPLNyXfTjtd6wBCTobk2IRFLxvvezoGrmErujjM8Y1C9I0NOY-9azGRWC8GT88SmOCEZKAPaWMDryL3HlXEQEzfVtN_o"
  },
  {
    "_id": "696dfadda2aefaf7c6688da9",
    "name": "JJB1",
    "email": "jjb1@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "xyz",
    "fcmtoken": "cp_I6O2pQ6CekRNHiqu3Ge:APA91bEK06xMOMhpSYUKJPF_gD-ZyM5Zf-9nsKaytkEK2bpHR0VPvdsX0ZBG5uG9LV9NMambLBTpAjiYRRq6DLsFdDgCk3FeRhC8I_ublHhMOTlzs9d2YME"
  },
  {
    "_id": "697319cfa2aefaf7c66ce028",
    "name": "MY",
    "email": "my@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": "eSg48CjnSICVQIby0Y2suo:APA91bE7jHqyUJVVt6JtUapTVCyIq76fMJj4m8_tTqzLrsjtppqimG-saCdxPGRpS387jROj3G_RhjXIhdFeKYvcAz1UysM4hqKV24XnFKe1gagH_Gw7o6I"
  },
  {
    "_id": "69b3d32b074311c3e4965a57",
    "name": "Nkr",
    "email": "navkar@muthaji.com",
    "phone": "987654321.",
    "role": "customer",
    "address": "abc",
    "fcmtoken": "d9k7Pz6uQXeiYKX-SJ6V8S:APA91bEULTBKCRa4iSYNs6KQOA4Utgl4GnEWYnfts_Ws94QJW4n4XKcvFPzOMb8xW-YhH9bg0Ow0VToIxcgYNkBjL8KBiLbS-ROK4n2YDCYKN8kuxjQ0rrc"
  },
  {
    "_id": "69b7e3f8074311c3e49a2225",
    "name": "TS",
    "email": "ts@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": "dbFVD89ASxqk-_xq9rqxiC:APA91bE3WmWpenZyF4o31gUE89-AeegoKaQw-dVSFATVw25HB87W8U4o0sWeE4fbQk6ANkfHZhBUojsVqmPf_KsiWmKcCB5c8mImAlnGBD7X5220d827QAg"
  },
  {
    "_id": "6a0c3bb791925bac34f418ef",
    "name": "BR",
    "email": "bharat@muthaji.com",
    "phone": "9876543210",
    "role": "employee",
    "address": "abc",
    "fcmtoken": "eOQqBum2Tj2emY111ovrpy:APA91bE46PvQ7E8CnVPlArYi5ejAlFgZeseiR3mPt813bKKbKXaXmD9g1i157MU7PorhZQxYBAyv2pPgZ_EmqvumMOFxWlVknKG8CKb9qcpzyyXM3x-kDmo"
  },
  {
    "_id": "6a14434191925bac341e0307",
    "name": "WAX",
    "email": "wax@muthaji.com",
    "phone": "9876543210",
    "role": "employee",
    "address": "35",
    "fcmtoken": "cfak39W3RXyn5cCuM1UilG:APA91bH09wEWSXSzXLu_Sr2QqQq1fLi02iC9X08o_AtYd41yjnVK66l1PglNt2cmNZWLFLEaZEAqGE6nAD-r6YY3BD1AttX7zCuynkM71App-CM-vQ64PXc"
  },
  {
    "_id": "6a190e8e91925bac343bea82",
    "name": "AMG",
    "email": "amg@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "Abc",
    "fcmtoken": ""
  },
  {
    "_id": "6a1946ff91925bac343fb13a",
    "name": "MIX BK",
    "email": "mixbk@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": ""
  },
  {
    "_id": "6a27f6af0f2850c4a7b8b4d6",
    "name": "DXB",
    "email": "dxb@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": ""
  },
  {
    "_id": "6a58a6f3bf4754929733c4b0",
    "name": "SG",
    "email": "sg@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": ""
  },
  {
    "_id": "6a9e66355d2b2c9a98df6a49",
    "name": "UG",
    "email": "ug@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": ""
  },
  {
    "_id": "6abb91505d2b2c9a98436ae7",
    "name": "TJ",
    "email": "tj@muthaji.com",
    "phone": "1234567890",
    "role": "customer",
    "address": "abc",
    "fcmtoken": ""
  },
  {
    "_id": "6acf75ad5d2b2c9a98a175cd",
    "name": "NIVYA",
    "email": "nivya@muthaji.com",
    "phone": "9876543210",
    "role": "customer",
    "address": "abc",
    "fcmtoken": ""
  }
];

async function seed() {
  const dbUri = process.env.DATA_BASE_URL;
  if (!dbUri) {
    console.error("DATA_BASE_URL is not set in environment or .env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB successfully!");

    // 1. Seed Categories
    console.log(`\n--- Seeding ${categoriesData.length} Categories ---`);
    let catUpdated = 0;
    for (const cat of categoriesData) {
      await Category.findByIdAndUpdate(
        cat._id,
        {
          categoryname: cat.categoryname,
          size: cat.size,
          unit: cat.unit
        },
        { upsert: true, new: true }
      );
      catUpdated++;
      console.log(`✓ Upserted Category: ${cat.categoryname} (${cat._id})`);
    }
    console.log(`Total Categories Processed: ${catUpdated}`);

    // 2. Seed Users
    console.log(`\n--- Seeding ${usersData.length} Users ---`);
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "123456";
    const defaultPasswordHash = bcrypt.hashSync(defaultPassword, 10);

    let userCreated = 0;
    let userUpdated = 0;

    for (const u of usersData) {
      const existingUser = await User.findById(u._id);
      if (existingUser) {
        existingUser.name = u.name;
        existingUser.email = u.email;
        existingUser.phone = u.phone;
        existingUser.role = u.role;
        existingUser.address = u.address;
        if (u.fcmtoken !== undefined) existingUser.fcmtoken = u.fcmtoken;
        await existingUser.save();
        userUpdated++;
        console.log(`✓ Updated User: ${u.name} (${u.email})`);
      } else {
        // Also check if email exists with a different _id
        const userByEmail = await User.findOne({ email: u.email });
        if (userByEmail) {
          userByEmail.name = u.name;
          userByEmail.phone = u.phone;
          userByEmail.role = u.role;
          userByEmail.address = u.address;
          if (u.fcmtoken !== undefined) userByEmail.fcmtoken = u.fcmtoken;
          await userByEmail.save();
          userUpdated++;
          console.log(`✓ Updated User by email: ${u.name} (${u.email})`);
        } else {
          await User.create({
            _id: new mongoose.Types.ObjectId(u._id),
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            address: u.address,
            fcmtoken: u.fcmtoken || '',
            password: defaultPasswordHash
          });
          userCreated++;
          console.log(`+ Created User: ${u.name} (${u.email}) [Default pass: ${defaultPassword}]`);
        }
      }
    }

    console.log(`\nUsers Created: ${userCreated}, Users Updated: ${userUpdated}`);
    console.log("\n Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed with error:", err);
    process.exit(1);
  }
}

seed();
