// ** jest, mocha vb. js test araçları ve teknikleri ile ilgili daha detaylı araştırma ve çalışmalar yapılacak!!!

const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add } = require("../src/math");
// jest - test framework kullanımı örneği..


// // bu test case passed dönecek.
// test("should 1+2 equal 3", () => {
// 	expect(1 + 2).toBe(3);
// });

// // bu test hata vericek...
// test('This should  fail', () => {
//     throw new Error('Failure!')
// })

test("should return total with tip", () => {
	const total = calculateTip(25);

	// manual olarak kontrol ediyoruz. bunun yerine jest metodlarını kullanıcaz..
	// if(total !== 32.5){
	//     throw new Error('Total tip should be 32.5, Total: ' + total)
	// }

	expect(total).toBe(32.5);
});

// assertion dediğimiz yapıları kullanıyoruz. bu yapılar ile bir fonksiyon sonucu bir tahmin de ya da beklentide bulunuyoruz. test içinde çalışan fonksiyonun sonucuna ve ne döndüğüne bakarak farklı tipte assertionları kullanıyoruz.

test("passes when value is NaN", () => {
	expect(NaN).toBeNaN(); // true
	expect(1).not.toBeNaN(); // true
});

// describe creates a block that groups together several related tests. For example, if you have a myBeverage object that is supposed to be delicious but not sour, you could test it with:
const myBeverage = {
	delicious: true,
	sour: false,
};

describe("my beverage", () => {
	test("is delicious", () => {
		expect(myBeverage.delicious).toBeTruthy(); // true dönmesini bekledik ve öyle oldu.
	});

	test("is not sour", () => {
		expect(myBeverage.sour).toBeFalsy(); // false dönmesini bekledik ve öyle döndüğü için testten geçmiş oldu.
	});
});

describe("Temperature conversions", () => {
	test("Should convert 32 F to 0 C", () => {
		expect(fahrenheitToCelsius(32)).toBe(0);
	});
	test("Should convert 0 C to 32 F", () => {
		expect(celsiusToFahrenheit(0)).toBe(32);
	});
});

// asenkron fonskiyonlarda test işlemleri -----

// test('Async test demo',(done)=>{
// 	setTimeout(() => {
// 		expect(1).toBe(2)
// 		// bariz hata vericek bir işlem sonucu ama callback fonksiyonları jestin anlaması için bizim de test uygulamasına parametre tanımlayarak onu bir callback func. gibi çalıştırmamız lazım..
// 		done()
// 	}, 2000);
// })

// **-- There is an alternate form of test that fixes this. Instead of putting the test in a function with an empty argument, use a single argument called done. Jest will wait until the done callback is called before finishing the test.
