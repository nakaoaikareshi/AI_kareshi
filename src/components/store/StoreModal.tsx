import React, { useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { StoreItem, Character } from '@/types';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
}

const getMockItems = (gender: 'boyfriend' | 'girlfriend'): StoreItem[] => {
  if (gender === 'girlfriend') {
    return [
      {
        id: 'gf1',
        name: '可愛いワンピース',
        category: 'outfit',
        price: 1500,
        imageUrl: '/items/dress1.png',
        description: 'フェミニンで可愛いワンピース',
        isPremium: false,
      },
      {
        id: 'gf2', 
        name: 'ツインテール',
        category: 'hair',
        price: 800,
        imageUrl: '/items/hair1.png',
        description: '元気いっぱいなツインテール',
        isPremium: false,
      },
      {
        id: 'gf3',
        name: 'リボンヘアバンド',
        category: 'accessories',
        price: 500,
        imageUrl: '/items/ribbon1.png', 
        description: 'キュートなリボンのヘアバンド',
        isPremium: false,
      },
      {
        id: 'gf4',
        name: '限定ドレス',
        category: 'outfit',
        price: 3000,
        imageUrl: '/items/premium_dress.png',
        description: '特別な日のための豪華なドレス',
        isPremium: true,
      },
      {
        id: 'gf5',
        name: 'ロングヘア',
        category: 'hair',
        price: 900,
        imageUrl: '/items/long_hair.png',
        description: 'エレガントなロングヘア',
        isPremium: false,
      },
      {
        id: 'gf6',
        name: 'フリルブラウス',
        category: 'outfit',
        price: 1200,
        imageUrl: '/items/blouse.png',
        description: '上品なフリルブラウス',
        isPremium: false,
      },
    ];
  } else {
    return [
      {
        id: 'bf1',
        name: 'カジュアルシャツ',
        category: 'outfit',
        price: 1200,
        imageUrl: '/items/casual_shirt.png',
        description: 'おしゃれなカジュアルシャツ',
        isPremium: false,
      },
      {
        id: 'bf2',
        name: 'スーツ',
        category: 'outfit',
        price: 2500,
        imageUrl: '/items/suit.png',
        description: 'かっこいいビジネススーツ',
        isPremium: true,
      },
      {
        id: 'bf3',
        name: 'ショートヘア',
        category: 'hair',
        price: 600,
        imageUrl: '/items/short_hair.png',
        description: 'さわやかなショートヘア',
        isPremium: false,
      },
      {
        id: 'bf4',
        name: '腕時計',
        category: 'accessories',
        price: 800,
        imageUrl: '/items/watch.png',
        description: 'シンプルで上品な腕時計',
        isPremium: false,
      },
      {
        id: 'bf5',
        name: 'パーカー',
        category: 'outfit',
        price: 1000,
        imageUrl: '/items/hoodie.png',
        description: 'リラックスできるパーカー',
        isPremium: false,
      },
      {
        id: 'bf6',
        name: 'ネックレス',
        category: 'accessories',
        price: 1500,
        imageUrl: '/items/necklace.png',
        description: 'おしゃれなシルバーネックレス',
        isPremium: true,
      },
    ];
  }
};

export const StoreModal: React.FC<StoreModalProps> = ({ isOpen, onClose, character }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hair' | 'outfit' | 'accessories'>('all');
  const [cart, setCart] = useState<string[]>([]);

  if (!isOpen) return null;

  const mockItems = getMockItems(character.gender);
  const filteredItems = selectedCategory === 'all' 
    ? mockItems 
    : mockItems.filter(item => item.category === selectedCategory);

  const addToCart = (itemId: string) => {
    setCart(prev => [...prev, itemId]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(id => id !== itemId));
  };

  const isInCart = (itemId: string) => cart.includes(itemId);

  const getTotalPrice = () => {
    return mockItems
      .filter(item => cart.includes(item.id))
      .reduce((total, item) => total + item.price, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={20} />
            <h2 className="text-lg font-semibold">アイテムショップ</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'outfit', label: '服装' },
            { key: 'hair', label: '髪型' },
            { key: 'accessories', label: 'アクセサリー' },
          ].map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as 'hair' | 'outfit' | 'accessories' | 'all')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.key
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">画像</span>
                </div>
                <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${item.isPremium ? 'text-purple-600' : 'text-blue-600'}`}>
                    ¥{item.price}
                  </span>
                  {isInCart(item.id) ? (
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(item.id)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      追加
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">カート内: {cart.length}個</span>
              <span className="font-bold text-lg">¥{getTotalPrice()}</span>
            </div>
            <button className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
              購入する
            </button>
          </div>
        )}
      </div>
    </div>
  );
};