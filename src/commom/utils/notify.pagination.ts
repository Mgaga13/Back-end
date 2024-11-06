import { PageOptionsDto } from '../dto/pageOptions.dto';

export const pagination = (options: PageOptionsDto, data: any[]) => {
  const { page = 1, limit = 10, order, sort } = options;
  const total = data.length;
  const totalPage = Math.ceil(total / limit);
  const nextPage = page + 1 > totalPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;
  // sắp xếp mảng
  if (sort && order) {
    data.sort((a, b) => {
      const valueA = a[sort];
      const valueB = b[sort];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (order === 'ASC') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }

      if (order === 'ASC') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }

  // chia mảng thành các mảng con với số lượng phần tử bằng limit (số lượng phần tử của mảng con cuối cùng có thể nhỏ hơn limit)
  const dataChunk = [];
  for (let i = 0; i < data.length; i += limit) {
    dataChunk.push(data.slice(i, i + limit));
  }

  return {
    data: dataChunk[page - 1] || [],
    meta: {
      total,
      page,
      totalPage,
      limit,
      nextPage,
      prevPage,
    },
  };
};
