import React, { useState } from 'react';

interface AddBlogModalProps {
  onClose: () => void;
  onAddBlog: (blog: {
    title: string;
    content: string;
    author: string;
    color: string;
  }) => void;
}

const COLORS = [
  { name: '默认', value: 'bg-white' },
  { name: '蓝色', value: 'bg-blue-50' },
  { name: '绿色', value: 'bg-green-50' },
  { name: '黄色', value: 'bg-yellow-50' },
  { name: '红色', value: 'bg-red-50' },
  { name: '紫色', value: 'bg-purple-50' },
];

const AddBlogModal: React.FC<AddBlogModalProps> = ({ onClose, onAddBlog }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    color: 'bg-white'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBlog(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">添加新博客</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              标题
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              内容
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                rows={4}
                required
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              作者
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                required
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              卡片颜色
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
              >
                {COLORS.map(color => (
                  <option key={color.value} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogModal; 