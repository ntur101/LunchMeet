import appleImage from '../assets/red_apple.jpeg';
import orangeJuiceImage from '../assets/orange_juice.webp';
import upAndGoImage from '../assets/Up_and_Go.jpeg';

function FoodDetail() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Purple Header */}
      <div className="bg-purple-600 px-4 py-4 flex items-center">
        <button className="mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 bg-white rounded-full px-4 py-2">
          <input 
            type="text" 
            placeholder="Search for food" 
            className="w-full outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        {/* Apple Image */}
        <div className="flex justify-center mb-6">
          <img 
            src={appleImage}
            alt="Red Apple" 
            className="w-80 h-80 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6">Red Apple</h2>

        {/* Details Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Details:</h3>
          <p className="text-gray-700 mb-2">It's Fresh As Trust Its From New World</p>
          <p className="text-gray-700">And My Mum Got This From Mart Yesterday</p>
        </div>

        {/* User Is Also Trading Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">User Is Also Trading</h3>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <img 
                src={orangeJuiceImage}
                alt="Orange Juice" 
                className="w-24 h-24 object-cover rounded-lg shadow-md"
              />
              <p className="text-sm mt-2">Orange Juice</p>
            </div>
            <div className="text-center">
              <img 
                src={upAndGoImage}
                alt="Up&Go Drink" 
                className="w-24 h-24 object-cover rounded-lg shadow-md"
              />
              <p className="text-sm mt-2">Up&Go Drink</p>
            </div>
          </div>
        </div>

        {/* Trade Button */}
        <div className="flex justify-center">
          <button className="bg-gray-400 text-white px-16 py-4 rounded-full text-xl font-semibold hover:bg-gray-500 transition-colors">
            Trade
          </button>
        </div>
      </div>
    </div>
  );
}
export default FoodDetail;